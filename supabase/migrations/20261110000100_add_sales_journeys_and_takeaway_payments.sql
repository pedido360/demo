BEGIN;

-- Jornadas operativas: una sola jornada abierta por restaurante.
CREATE TABLE public.sales_journeys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    opened_by_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    opened_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed')),
    closed_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
    closed_at timestamptz,
    close_summary jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT sales_journeys_close_consistency CHECK (
        (status = 'open' AND closed_by_profile_id IS NULL AND closed_at IS NULL AND close_summary IS NULL)
        OR
        (status = 'closed' AND closed_by_profile_id IS NOT NULL AND closed_at IS NOT NULL AND close_summary IS NOT NULL)
    )
);

CREATE UNIQUE INDEX sales_journeys_one_open_per_restaurant
    ON public.sales_journeys (restaurant_id)
    WHERE status = 'open';

CREATE INDEX sales_journeys_history_idx
    ON public.sales_journeys (restaurant_id, opened_at DESC);

-- Los pedidos históricos permanecen con sales_journey_id NULL.
ALTER TABLE public.service_orders
    ADD COLUMN sales_journey_id uuid
    REFERENCES public.sales_journeys(id) ON DELETE RESTRICT;

CREATE INDEX service_orders_journey_idx
    ON public.service_orders (sales_journey_id, created_at);

-- Libro financiero independiente para pedidos para llevar sin mesa.
CREATE TABLE public.independent_order_payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL,
    waiter_id uuid NOT NULL REFERENCES public.waiter_accounts(id) ON DELETE RESTRICT,
    transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'reversal')),
    payment_method text CHECK (payment_method IN ('cash', 'transfer')),
    amount numeric(12,2) NOT NULL CHECK (amount > 0 AND amount = trunc(amount)),
    reference text,
    reason text,
    related_transaction_id uuid REFERENCES public.independent_order_payment_transactions(id) ON DELETE RESTRICT,
    idempotency_key uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT independent_order_payment_order_fk
        FOREIGN KEY (order_id, restaurant_id)
        REFERENCES public.service_orders(id, restaurant_id) ON DELETE RESTRICT,
    CONSTRAINT independent_order_payment_type_consistency CHECK (
        (transaction_type = 'payment' AND payment_method IS NOT NULL AND related_transaction_id IS NULL AND reason IS NULL)
        OR
        (transaction_type = 'reversal' AND payment_method IS NULL AND related_transaction_id IS NOT NULL AND reason IS NOT NULL)
    ),
    CONSTRAINT independent_order_payment_idempotency
        UNIQUE (restaurant_id, idempotency_key)
);

CREATE INDEX independent_order_payments_order_idx
    ON public.independent_order_payment_transactions (order_id, created_at);

-- Verificación explícita de cada pago por Caja.
CREATE TABLE public.independent_order_payment_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL,
    transaction_id uuid NOT NULL UNIQUE
        REFERENCES public.independent_order_payment_transactions(id) ON DELETE RESTRICT,
    verified_by_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    verified_amount numeric(12,2) NOT NULL CHECK (verified_amount > 0),
    notes text,
    verified_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT independent_order_verification_order_fk
        FOREIGN KEY (order_id, restaurant_id)
        REFERENCES public.service_orders(id, restaurant_id) ON DELETE RESTRICT
);

CREATE INDEX independent_order_verifications_order_idx
    ON public.independent_order_payment_verifications (order_id, verified_at);

-- Protección de los libros financieros: no se actualizan ni eliminan movimientos.
CREATE TRIGGER independent_order_payments_no_update_delete
BEFORE UPDATE OR DELETE ON public.independent_order_payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

CREATE TRIGGER independent_order_payments_no_truncate
BEFORE TRUNCATE ON public.independent_order_payment_transactions
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

CREATE TRIGGER independent_order_verifications_no_update_delete
BEFORE UPDATE OR DELETE ON public.independent_order_payment_verifications
FOR EACH ROW
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

CREATE TRIGGER independent_order_verifications_no_truncate
BEFORE TRUNCATE ON public.independent_order_payment_verifications
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

ALTER TABLE public.sales_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.independent_order_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.independent_order_payment_verifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sales_journeys FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.independent_order_payment_transactions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.independent_order_payment_verifications FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.sales_journeys TO service_role;
GRANT ALL ON public.independent_order_payment_transactions TO service_role;
GRANT ALL ON public.independent_order_payment_verifications TO service_role;



-- Abrir jornada: exclusivamente administrador del restaurante.
CREATE OR REPLACE FUNCTION public.open_sales_journey(p_restaurant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_journey public.sales_journeys%ROWTYPE;
BEGIN
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
        RAISE EXCEPTION 'Solo el administrador del restaurante puede abrir la jornada.'
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.sales_journeys (restaurant_id, opened_by_profile_id)
    VALUES (p_restaurant_id, auth.uid())
    RETURNING * INTO v_journey;

    INSERT INTO public.service_audit_logs (
        restaurant_id, actor_profile_id, action, entity_type, entity_id, details
    ) VALUES (
        p_restaurant_id, auth.uid(), 'sales_journey_opened',
        'sales_journey', v_journey.id, jsonb_build_object('opened_at', v_journey.opened_at)
    );

    RETURN jsonb_build_object(
        'success', true, 'journeyId', v_journey.id, 'openedAt', v_journey.opened_at
    );
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ya existe una jornada abierta para este restaurante.';
END;
$function$;

-- Todo pedido nuevo queda ligado a la jornada abierta en la misma transacción.
CREATE OR REPLACE FUNCTION public.assign_order_to_open_sales_journey()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
    SELECT id INTO NEW.sales_journey_id
    FROM public.sales_journeys
    WHERE restaurant_id = NEW.restaurant_id
      AND status = 'open'
    FOR UPDATE;

    IF NEW.sales_journey_id IS NULL THEN
        RAISE EXCEPTION 'No hay una jornada abierta. Solicita a Caja que la abra antes de registrar pedidos.';
    END IF;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER service_orders_assign_sales_journey
BEFORE INSERT ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_order_to_open_sales_journey();

REVOKE ALL ON FUNCTION public.open_sales_journey(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_sales_journey(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_independent_takeaway_payment(
    p_order_id uuid,
    p_amount numeric,
    p_payment_method text,
    p_reference text,
    p_idempotency_key uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_waiter public.waiter_accounts%ROWTYPE;
    v_order public.service_orders%ROWTYPE;
    v_existing public.independent_order_payment_transactions%ROWTYPE;
    v_paid numeric(12,2);
    v_balance numeric(12,2);
    v_payment public.independent_order_payment_transactions%ROWTYPE;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 OR p_amount <> trunc(p_amount) THEN
        RAISE EXCEPTION 'El valor del abono debe ser un número entero positivo.';
    END IF;

    IF p_payment_method NOT IN ('cash', 'transfer') THEN
        RAISE EXCEPTION 'Método de pago no válido.';
    END IF;

    IF p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'Falta la clave de seguridad del pago.';
    END IF;

    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesión no válida.';
    END IF;

    SELECT * INTO v_waiter
    FROM public.waiter_accounts
    WHERE profile_id = auth.uid()
      AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No tienes una cuenta de mesero activa.'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_order
    FROM public.service_orders
    WHERE id = p_order_id
      AND restaurant_id = v_waiter.restaurant_id
    FOR UPDATE;

    IF NOT FOUND
       OR v_order.waiter_id <> v_waiter.id
       OR v_order.order_type <> 'takeaway'
       OR v_order.table_session_id IS NOT NULL
       OR v_order.status <> 'confirmed' THEN
        RAISE EXCEPTION 'El pedido no existe o no corresponde a un pedido para llevar independiente tuyo.'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_existing
    FROM public.independent_order_payment_transactions
    WHERE restaurant_id = v_order.restaurant_id
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_existing.order_id <> p_order_id
           OR v_existing.transaction_type <> 'payment' THEN
            RAISE EXCEPTION 'La clave de pago ya fue utilizada.';
        END IF;

        RETURN jsonb_build_object(
            'success', true,
            'duplicate', true,
            'transactionId', v_existing.id,
            'amount', v_existing.amount
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.sales_journeys
        WHERE id = v_order.sales_journey_id
          AND status = 'open'
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'La jornada no está abierta.';
    END IF;

    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type = 'payment' THEN amount
            ELSE -amount
        END
    ), 0)
    INTO v_paid
    FROM public.independent_order_payment_transactions
    WHERE order_id = p_order_id;

    v_balance := v_order.total - v_paid;

    IF p_amount > v_balance THEN
        RAISE EXCEPTION 'El abono supera el saldo pendiente: %.', v_balance;
    END IF;

    INSERT INTO public.independent_order_payment_transactions (
        restaurant_id, order_id, waiter_id, transaction_type,
        payment_method, amount, reference, idempotency_key
    ) VALUES (
        v_order.restaurant_id, v_order.id, v_waiter.id, 'payment',
        p_payment_method, p_amount, NULLIF(trim(p_reference), ''),
        p_idempotency_key
    )
    RETURNING * INTO v_payment;

    INSERT INTO public.service_audit_logs (
        restaurant_id, actor_profile_id, actor_waiter_id,
        action, entity_type, entity_id, details
    ) VALUES (
        v_order.restaurant_id, auth.uid(), v_waiter.id,
        'independent_takeaway_payment_recorded',
        'service_order', v_order.id,
        jsonb_build_object(
            'transaction_id', v_payment.id,
            'amount', v_payment.amount,
            'payment_method', v_payment.payment_method
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'duplicate', false,
        'transactionId', v_payment.id,
        'amount', v_payment.amount,
        'balance', v_balance - v_payment.amount
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.record_independent_takeaway_payment(uuid, numeric, text, text, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.record_independent_takeaway_payment(uuid, numeric, text, text, uuid)
TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_independent_takeaway_payment(
    p_order_id uuid,
    p_transaction_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_order public.service_orders%ROWTYPE;
    v_payment public.independent_order_payment_transactions%ROWTYPE;
    v_reversed numeric(12,2);
    v_verified public.independent_order_payment_verifications%ROWTYPE;
BEGIN
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo Caja puede verificar pagos.'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_order
    FROM public.service_orders
    WHERE id = p_order_id
      AND restaurant_id = v_profile.restaurant_id
      AND order_type = 'takeaway'
      AND table_session_id IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido independiente para llevar no encontrado.';
    END IF;

    SELECT * INTO v_payment
    FROM public.independent_order_payment_transactions
    WHERE id = p_transaction_id
      AND order_id = p_order_id
      AND restaurant_id = v_profile.restaurant_id
      AND transaction_type = 'payment'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el pago indicado.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.independent_order_payment_verifications
        WHERE transaction_id = p_transaction_id
    ) THEN
        RAISE EXCEPTION 'Este pago ya fue verificado por Caja.';
    END IF;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_reversed
    FROM public.independent_order_payment_transactions
    WHERE related_transaction_id = p_transaction_id
      AND transaction_type = 'reversal';

    IF v_reversed >= v_payment.amount THEN
        RAISE EXCEPTION 'El pago fue reversado y no puede verificarse.';
    END IF;

    INSERT INTO public.independent_order_payment_verifications (
        restaurant_id, order_id, transaction_id,
        verified_by_profile_id, verified_amount, notes
    ) VALUES (
        v_profile.restaurant_id, p_order_id, p_transaction_id,
        auth.uid(), v_payment.amount - v_reversed,
        NULLIF(trim(p_notes), '')
    )
    RETURNING * INTO v_verified;

    INSERT INTO public.service_audit_logs (
        restaurant_id, actor_profile_id, action,
        entity_type, entity_id, details
    ) VALUES (
        v_profile.restaurant_id, auth.uid(),
        'independent_takeaway_payment_verified',
        'service_order', p_order_id,
        jsonb_build_object(
            'transaction_id', p_transaction_id,
            'verification_id', v_verified.id,
            'verified_amount', v_verified.verified_amount,
            'payment_method', v_payment.payment_method
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'verificationId', v_verified.id,
        'verifiedAmount', v_verified.verified_amount,
        'verifiedAt', v_verified.verified_at
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.verify_independent_takeaway_payment(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_independent_takeaway_payment(uuid, uuid, text)
TO authenticated;

CREATE OR REPLACE FUNCTION public.close_sales_journey(p_restaurant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_journey public.sales_journeys%ROWTYPE;
    v_open_tables integer;
    v_unsettled_orders integer;
    v_pending_print_jobs integer;
    v_summary jsonb;
BEGIN
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
        RAISE EXCEPTION 'Solo Caja puede cerrar la jornada.'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_journey
    FROM public.sales_journeys
    WHERE restaurant_id = p_restaurant_id
      AND status = 'open'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No hay una jornada abierta para cerrar.';
    END IF;

    SELECT COUNT(*) INTO v_open_tables
    FROM public.table_sessions
    WHERE restaurant_id = p_restaurant_id
      AND status = 'open';

    IF v_open_tables > 0 THEN
        RAISE EXCEPTION 'No se puede cerrar la jornada: hay % mesas abiertas.', v_open_tables;
    END IF;

    SELECT COUNT(*) INTO v_unsettled_orders
    FROM public.service_orders o
    WHERE o.sales_journey_id = v_journey.id
      AND o.status = 'confirmed'
      AND o.order_type = 'takeaway'
      AND o.table_session_id IS NULL
      AND (
          o.total > COALESCE((
              SELECT SUM(
                  CASE WHEN t.transaction_type = 'payment'
                       THEN t.amount ELSE -t.amount END
              )
              FROM public.independent_order_payment_transactions t
              WHERE t.order_id = o.id
          ), 0)
          OR
          COALESCE((
              SELECT SUM(
                  CASE WHEN t.transaction_type = 'payment'
                       THEN t.amount ELSE -t.amount END
              )
              FROM public.independent_order_payment_transactions t
              WHERE t.order_id = o.id
          ), 0) > COALESCE((
              SELECT SUM(v.verified_amount)
              FROM public.independent_order_payment_verifications v
              WHERE v.order_id = o.id
          ), 0)
      );

    IF v_unsettled_orders > 0 THEN
        RAISE EXCEPTION 'No se puede cerrar: hay % pedidos para llevar con saldo o pagos sin verificar.', v_unsettled_orders;
    END IF;

    SELECT COUNT(*) INTO v_pending_print_jobs
    FROM public.print_jobs pj
    JOIN public.service_orders o ON o.id = pj.service_order_id
    WHERE o.sales_journey_id = v_journey.id
      AND pj.status IN ('queued', 'processing', 'failed', 'submitted');

    IF v_pending_print_jobs > 0 THEN
        RAISE EXCEPTION 'No se puede cerrar: hay % trabajos de impresión pendientes o fallidos.', v_pending_print_jobs;
    END IF;

    SELECT jsonb_build_object(
        'journey_id', v_journey.id,
        'opened_at', v_journey.opened_at,
        'closed_at', now(),
        'confirmed_order_count', COUNT(*) FILTER (WHERE o.status = 'confirmed'),
        'cancelled_order_count', COUNT(*) FILTER (WHERE o.status = 'cancelled'),
        'confirmed_sales_total', COALESCE(
            SUM(o.total) FILTER (WHERE o.status = 'confirmed'), 0
        ),
        'average_ticket', COALESCE(
            AVG(o.total) FILTER (WHERE o.status = 'confirmed'), 0
        ),
        'verified_independent_takeaway_payments', COALESCE((
            SELECT SUM(v.verified_amount)
            FROM public.independent_order_payment_verifications v
            JOIN public.service_orders io ON io.id = v.order_id
            WHERE io.sales_journey_id = v_journey.id
        ), 0),
        'verified_table_payments', COALESCE((
            SELECT SUM(v.verified_amount)
            FROM public.cashier_payment_verifications v
            WHERE v.session_id IN (
                SELECT DISTINCT so.table_session_id
                FROM public.service_orders so
                WHERE so.sales_journey_id = v_journey.id
                  AND so.table_session_id IS NOT NULL
            )
        ), 0),
        'orders', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'order_id', x.id,
                    'order_number', x.order_number,
                    'order_type', x.order_type,
                    'table_session_id', x.table_session_id,
                    'waiter_id', x.waiter_id,
                    'status', x.status,
                    'items', x.items,
                    'total', x.total,
                    'created_at', x.created_at,
                    'notes', x.notes
                ) ORDER BY x.created_at
            )
            FROM public.service_orders x
            WHERE x.sales_journey_id = v_journey.id
        ), '[]'::jsonb)
    )
    INTO v_summary
    FROM public.service_orders o
    WHERE o.sales_journey_id = v_journey.id;

    UPDATE public.sales_journeys
    SET status = 'closed',
        closed_by_profile_id = auth.uid(),
        closed_at = now(),
        close_summary = v_summary
    WHERE id = v_journey.id;

    INSERT INTO public.service_audit_logs (
        restaurant_id, actor_profile_id, action,
        entity_type, entity_id, details
    ) VALUES (
        p_restaurant_id, auth.uid(), 'sales_journey_closed',
        'sales_journey', v_journey.id, v_summary
    );

    RETURN jsonb_build_object(
        'success', true,
        'journeyId', v_journey.id,
        'summary', v_summary
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.close_sales_journey(uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.close_sales_journey(uuid)
TO authenticated;



-- Los cierres históricos son inmutables; solo se permite cerrar una jornada abierta.
CREATE OR REPLACE FUNCTION public.protect_sales_journey_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'El historial de jornadas no se puede eliminar.';
    END IF;

    IF OLD.status <> 'open'
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.restaurant_id IS DISTINCT FROM OLD.restaurant_id
       OR NEW.opened_by_profile_id IS DISTINCT FROM OLD.opened_by_profile_id
       OR NEW.opened_at IS DISTINCT FROM OLD.opened_at
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.status <> 'closed'
       OR NEW.closed_by_profile_id IS NULL
       OR NEW.closed_at IS NULL
       OR NEW.close_summary IS NULL THEN
        RAISE EXCEPTION 'La jornada solo puede cerrarse una vez; su historial es inmutable.';
    END IF;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER sales_journeys_immutable_history
BEFORE UPDATE OR DELETE ON public.sales_journeys
FOR EACH ROW
EXECUTE FUNCTION public.protect_sales_journey_history();

-- Reverso administrativo de pagos independientes, sin alterar el movimiento original.
CREATE OR REPLACE FUNCTION public.reverse_independent_takeaway_payment(
    p_transaction_id uuid,
    p_reason text,
    p_idempotency_key uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_payment public.independent_order_payment_transactions%ROWTYPE;
    v_reversed numeric(12,2);
    v_reversal public.independent_order_payment_transactions%ROWTYPE;
    v_existing public.independent_order_payment_transactions%ROWTYPE;
BEGIN
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo Caja puede reversar pagos.'
            USING ERRCODE = '42501';
    END IF;

    IF p_reason IS NULL OR length(trim(p_reason)) < 3
       OR p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'El reverso requiere un motivo y una clave de seguridad.';
    END IF;

    SELECT * INTO v_existing
    FROM public.independent_order_payment_transactions
    WHERE restaurant_id = v_profile.restaurant_id
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_existing.transaction_type <> 'reversal'
           OR v_existing.related_transaction_id IS DISTINCT FROM p_transaction_id THEN
            RAISE EXCEPTION 'La clave de seguridad ya fue utilizada para otra operación.';
        END IF;
        RETURN jsonb_build_object(
            'success', true,
            'reversalId', v_existing.id,
            'amount', v_existing.amount
        );
    END IF;

    SELECT * INTO v_payment
    FROM public.independent_order_payment_transactions
    WHERE id = p_transaction_id
      AND restaurant_id = v_profile.restaurant_id
      AND transaction_type = 'payment'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el pago original.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.independent_order_payment_verifications
        WHERE transaction_id = p_transaction_id
    ) THEN
        RAISE EXCEPTION 'El pago ya fue verificado por Caja. No se puede reversar desde este flujo.';
    END IF;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_reversed
    FROM public.independent_order_payment_transactions
    WHERE related_transaction_id = p_transaction_id
      AND transaction_type = 'reversal';

    IF v_reversed >= v_payment.amount THEN
        RAISE EXCEPTION 'El pago ya fue reversado completamente.';
    END IF;

    INSERT INTO public.independent_order_payment_transactions (
        restaurant_id, order_id, waiter_id, transaction_type,
        payment_method, amount, reason, related_transaction_id,
        idempotency_key
    ) VALUES (
        v_payment.restaurant_id, v_payment.order_id, v_payment.waiter_id,
        'reversal', NULL, v_payment.amount - v_reversed,
        trim(p_reason), v_payment.id, p_idempotency_key
    )
    RETURNING * INTO v_reversal;

    INSERT INTO public.service_audit_logs (
        restaurant_id, actor_profile_id, action,
        entity_type, entity_id, details
    ) VALUES (
        v_profile.restaurant_id, auth.uid(),
        'independent_takeaway_payment_reversed',
        'service_order', v_payment.order_id,
        jsonb_build_object(
            'original_transaction_id', v_payment.id,
            'reversal_transaction_id', v_reversal.id,
            'amount', v_reversal.amount,
            'reason', v_reversal.reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'reversalId', v_reversal.id,
        'amount', v_reversal.amount
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.reverse_independent_takeaway_payment(uuid, text, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reverse_independent_takeaway_payment(uuid, text, uuid)
TO authenticated;

COMMIT;
