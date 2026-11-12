-- Pedidos360: confirmacion atomica de rondas y creacion de tickets.
-- Solo el servidor con service_role podra ejecutar esta funcion.

CREATE OR REPLACE FUNCTION public.confirm_service_order(
    p_restaurant_id uuid,
    p_waiter_id uuid,
    p_order_type text,
    p_table_session_id uuid,
    p_items jsonb,
    p_subtotal numeric,
    p_total numeric,
    p_notes text,
    p_idempotency_key uuid,
    p_cashier_payload jsonb,
    p_kitchen_payload jsonb
)
RETURNS TABLE (
    order_id uuid,
    order_number bigint,
    accumulated_table_total numeric,
    was_duplicate boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_waiter_restaurant_id uuid;
    v_session_restaurant_id uuid;
    v_table_label text;
    v_order_id uuid;
    v_order_number bigint;
    v_accumulated_total numeric(12,2);
    v_existing public.service_orders%ROWTYPE;
BEGIN
    IF p_restaurant_id IS NULL
       OR p_waiter_id IS NULL
       OR p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'Faltan identificadores obligatorios.';
    END IF;

    IF p_order_type IS NULL
       OR p_order_type NOT IN ('dine_in', 'takeaway') THEN
        RAISE EXCEPTION 'Tipo de pedido no valido.';
    END IF;

    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe contener productos.';
    END IF;

    IF p_subtotal IS NULL OR p_subtotal < 0
       OR p_subtotal <> trunc(p_subtotal)
       OR p_total IS NULL OR p_total < 0
       OR p_total <> trunc(p_total) THEN
        RAISE EXCEPTION 'Los importes del pedido no son validos.';
    END IF;

    IF p_cashier_payload IS NULL
       OR jsonb_typeof(p_cashier_payload) <> 'object'
       OR p_kitchen_payload IS NULL
       OR jsonb_typeof(p_kitchen_payload) <> 'object' THEN
        RAISE EXCEPTION 'Los datos de impresion no son validos.';
    END IF;

    -- Serializar solicitudes que reutilicen la misma clave.
    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            p_restaurant_id::text || ':' || p_idempotency_key::text,
            0
        )
    );

    -- Recuperar primero una confirmacion anterior, aunque la mesa ya este cerrada.
    SELECT so.*
      INTO v_existing
      FROM public.service_orders so
     WHERE so.restaurant_id = p_restaurant_id
       AND so.idempotency_key = p_idempotency_key;

    IF FOUND THEN
        -- Una clave repetida solo recupera el pedido si coincide su contenido
        -- comercial: productos, importes, notas, mesa y responsable.
        IF v_existing.waiter_id IS DISTINCT FROM p_waiter_id
           OR v_existing.order_type IS DISTINCT FROM p_order_type
           OR v_existing.table_session_id IS DISTINCT FROM p_table_session_id
           OR v_existing.items IS DISTINCT FROM p_items
           OR v_existing.subtotal IS DISTINCT FROM p_subtotal
           OR v_existing.total IS DISTINCT FROM p_total
           OR v_existing.notes IS DISTINCT FROM p_notes THEN
            RAISE EXCEPTION 'La clave de confirmacion ya pertenece a otro pedido.';
        END IF;

        v_accumulated_total := NULL;

        IF v_existing.order_type = 'dine_in' THEN
            SELECT COALESCE(SUM(so.total), 0)
              INTO v_accumulated_total
              FROM public.service_orders so
             WHERE so.table_session_id = v_existing.table_session_id
               AND so.status = 'confirmed';
        END IF;

        RETURN QUERY
        SELECT
            v_existing.id,
            v_existing.order_number,
            v_accumulated_total,
            true;
        RETURN;
    END IF;

    SELECT wa.restaurant_id
      INTO v_waiter_restaurant_id
      FROM public.waiter_accounts wa
      JOIN public.profiles p ON p.id = wa.profile_id
     WHERE wa.id = p_waiter_id
       AND wa.restaurant_id = p_restaurant_id
       AND wa.status = 'active'
       AND p.role = 'waiter'
       AND p.restaurant_id = p_restaurant_id
     FOR UPDATE OF wa;

    IF v_waiter_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'El mesero no esta activo o no pertenece al restaurante.';
    END IF;

    -- Validar y bloquear la mesa solamente para pedidos nuevos.
    v_table_label := 'PARA LLEVAR';

    IF p_order_type = 'dine_in' THEN
        IF p_table_session_id IS NULL THEN
            RAISE EXCEPTION 'El pedido de mesa necesita una cuenta abierta.';
        END IF;

        SELECT ts.restaurant_id, rt.label
          INTO v_session_restaurant_id, v_table_label
          FROM public.table_sessions ts
          JOIN public.restaurant_tables rt
            ON rt.id = ts.restaurant_table_id
           AND rt.restaurant_id = ts.restaurant_id
         WHERE ts.id = p_table_session_id
           AND ts.restaurant_id = p_restaurant_id
           AND ts.status = 'open'
           AND ts.opened_by_waiter_id = p_waiter_id
           AND rt.is_active = true
         FOR UPDATE OF ts;

        IF v_session_restaurant_id IS NULL THEN
            RAISE EXCEPTION 'La mesa no existe, esta inactiva o su cuenta esta cerrada.';
        END IF;
    ELSE
        IF p_table_session_id IS NOT NULL THEN
            RAISE EXCEPTION 'Un pedido para llevar no puede tener una cuenta de mesa.';
        END IF;
    END IF;

    INSERT INTO public.service_orders (
        restaurant_id,
        order_type,
        table_session_id,
        waiter_id,
        status,
        items,
        subtotal,
        total,
        notes,
        idempotency_key
    )
    VALUES (
        p_restaurant_id,
        p_order_type,
        p_table_session_id,
        p_waiter_id,
        'confirmed',
        p_items,
        p_subtotal,
        p_total,
        p_notes,
        p_idempotency_key
    )
    RETURNING id, service_orders.order_number
         INTO v_order_id, v_order_number;

    IF p_order_type = 'dine_in' THEN
        SELECT COALESCE(SUM(so.total), 0)
          INTO v_accumulated_total
          FROM public.service_orders so
         WHERE so.table_session_id = p_table_session_id
           AND so.status = 'confirmed';
    END IF;

    -- Copia de control de caja: no es una nueva comanda.
    INSERT INTO public.print_jobs (
        service_order_id,
        restaurant_id,
        destination,
        status,
        payload
    )
    VALUES (
        v_order_id,
        p_restaurant_id,
        'cashier',
        'queued',
        p_cashier_payload || jsonb_build_object(
            'copy_label', 'COPIA DE CONTROL - CAJA',
            'warning', 'NO ES PEDIDO NUEVO - NO PREPARAR',
            'order_total', p_total,
            'table_label', v_table_label,
            'table_accumulated_total', v_accumulated_total
        )
    );

    -- Cocina recibe exclusivamente los productos de esta ronda.
    INSERT INTO public.print_jobs (
        service_order_id,
        restaurant_id,
        destination,
        status,
        payload
    )
    VALUES (
        v_order_id,
        p_restaurant_id,
        'kitchen',
        'queued',
        p_kitchen_payload || jsonb_build_object(
            'ticket_type', 'KITCHEN_ORDER',
            'table_label', v_table_label
        )
    );

    RETURN QUERY
    SELECT v_order_id, v_order_number, v_accumulated_total, false;
END;
$function$;

-- No permitir ejecucion desde clientes publicos.
REVOKE ALL ON FUNCTION public.confirm_service_order(
    uuid, uuid, text, uuid, jsonb, numeric, numeric,
    text, uuid, jsonb, jsonb
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.confirm_service_order(
    uuid, uuid, text, uuid, jsonb, numeric, numeric,
    text, uuid, jsonb, jsonb
) TO service_role;



-- PRINT QUEUE: reclamacion exclusiva, confirmacion y reintentos.

CREATE OR REPLACE FUNCTION public.claim_print_jobs(
    p_agent_id uuid,
    p_limit integer DEFAULT 5,
    p_lease_seconds integer DEFAULT 60
)
RETURNS TABLE (
    job_id uuid,
    service_order_id uuid,
    destination text,
    payload jsonb,
    claim_token uuid,
    attempt_count integer,
    lease_expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_restaurant_id uuid;
    v_limit integer;
    v_lease integer;
BEGIN
    SELECT pa.restaurant_id
      INTO v_restaurant_id
      FROM public.print_agents pa
     WHERE pa.id = p_agent_id
       AND pa.is_active = true;

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Agente de impresion inexistente o inactivo.';
    END IF;

    v_limit := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 25);
    v_lease := LEAST(GREATEST(COALESCE(p_lease_seconds, 60), 15), 300);

    RETURN QUERY
    WITH candidates AS (
        SELECT pj.id
          FROM public.print_jobs pj
         WHERE pj.restaurant_id = v_restaurant_id
           AND pj.status = 'queued'
         ORDER BY pj.created_at, pj.id
         FOR UPDATE SKIP LOCKED
         LIMIT v_limit
    )
    UPDATE public.print_jobs pj
       SET status = 'processing',
           print_agent_id = p_agent_id,
           claim_token = gen_random_uuid(),
           claimed_at = now(),
           lease_expires_at = now() + make_interval(secs => v_lease),
           attempt_count = pj.attempt_count + 1,
           updated_at = now()
      FROM candidates c
     WHERE pj.id = c.id
    RETURNING
        pj.id,
        pj.service_order_id,
        pj.destination,
        pj.payload,
        pj.claim_token,
        pj.attempt_count,
        pj.lease_expires_at;
END;
$function$;


CREATE OR REPLACE FUNCTION public.acknowledge_print_job(
    p_job_id uuid,
    p_agent_id uuid,
    p_claim_token uuid,
    p_result text,
    p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    IF p_result NOT IN ('submitted', 'printed', 'failed') THEN
        RAISE EXCEPTION 'Resultado de impresion no valido.';
    END IF;

    UPDATE public.print_jobs pj
       SET status = p_result,
           last_error = CASE
               WHEN p_result = 'failed' THEN COALESCE(p_error, 'Error de impresion sin detalle.')
               ELSE NULL
           END,
           submitted_at = CASE
               WHEN p_result IN ('submitted', 'printed') THEN now()
               ELSE pj.submitted_at
           END,
           printed_at = CASE
               WHEN p_result = 'printed' THEN now()
               ELSE pj.printed_at
           END,
           claim_token = NULL,
           claimed_at = NULL,
           lease_expires_at = NULL,
           updated_at = now()
     WHERE pj.id = p_job_id
       AND pj.print_agent_id = p_agent_id
       AND pj.claim_token = p_claim_token
       AND pj.status = 'processing'
       AND pj.lease_expires_at > now()
       AND EXISTS (
           SELECT 1
             FROM public.print_agents pa
            WHERE pa.id = p_agent_id
              AND pa.restaurant_id = pj.restaurant_id
              AND pa.is_active = true
       );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trabajo no reclamado por este agente, vencido o ya procesado.';
    END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.recover_expired_print_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_count integer;
BEGIN
    UPDATE public.print_jobs
       SET status = 'failed',
           last_error = 'La reserva de impresion vencio. Verificar fisicamente la impresora antes de reintentar.',
           claim_token = NULL,
           claimed_at = NULL,
           lease_expires_at = NULL,
           updated_at = now()
     WHERE status = 'processing'
       AND lease_expires_at <= now();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$function$;


CREATE OR REPLACE FUNCTION public.retry_print_job(
    p_job_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    UPDATE public.print_jobs
       SET status = 'queued',
           last_error = NULL,
           claim_token = NULL,
           claimed_at = NULL,
           lease_expires_at = NULL,
           submitted_at = NULL,
           printed_at = NULL,
           updated_at = now()
     WHERE id = p_job_id
       AND status = 'failed';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El trabajo no existe o no esta en estado fallido.';
    END IF;
END;
$function$;


REVOKE ALL ON FUNCTION public.claim_print_jobs(uuid, integer, integer)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.acknowledge_print_job(uuid, uuid, uuid, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recover_expired_print_jobs()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.retry_print_job(uuid)
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_print_jobs(uuid, integer, integer)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.acknowledge_print_job(uuid, uuid, uuid, text, text)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.recover_expired_print_jobs()
    TO service_role;
GRANT EXECUTE ON FUNCTION public.retry_print_job(uuid)
    TO service_role;
