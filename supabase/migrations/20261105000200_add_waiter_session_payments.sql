BEGIN;

-- =========================================================
-- 1. LIBRO INMUTABLE DE PAGOS Y REVERSIÓN DE PAGOS
-- =========================================================

CREATE TABLE public.table_session_payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL,
    session_id uuid NOT NULL,
    waiter_id uuid NOT NULL,
    transaction_type text NOT NULL
        CHECK (transaction_type IN ('payment', 'reversal')),
    payment_method text NOT NULL
        CHECK (payment_method IN ('cash', 'transfer')),
    amount numeric(12,2) NOT NULL
        CHECK (amount > 0 AND amount = trunc(amount)),
    reference text,
    reason text,
    related_transaction_id uuid,
    idempotency_key uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT session_payment_transaction_consistency CHECK (
        (transaction_type = 'payment'
            AND related_transaction_id IS NULL
            AND reason IS NULL)
        OR
        (transaction_type = 'reversal'
            AND related_transaction_id IS NOT NULL
            AND reason IS NOT NULL
            AND length(btrim(reason)) > 0)
    ),

    CONSTRAINT session_payment_id_session_restaurant_unique
        UNIQUE (id, session_id, restaurant_id),

    CONSTRAINT session_payment_idempotency_unique
        UNIQUE (restaurant_id, idempotency_key),

    CONSTRAINT session_payment_session_restaurant_fk
        FOREIGN KEY (session_id, restaurant_id)
        REFERENCES public.table_sessions(id, restaurant_id)
        ON DELETE RESTRICT,

    CONSTRAINT session_payment_waiter_restaurant_fk
        FOREIGN KEY (waiter_id, restaurant_id)
        REFERENCES public.waiter_accounts(id, restaurant_id)
        ON DELETE RESTRICT,

    CONSTRAINT session_payment_reversal_origin_fk
        FOREIGN KEY (related_transaction_id, session_id, restaurant_id)
        REFERENCES public.table_session_payment_transactions(
            id, session_id, restaurant_id
        )
        ON DELETE RESTRICT
);

CREATE INDEX session_payment_history_idx
    ON public.table_session_payment_transactions
    (session_id, created_at DESC);

CREATE INDEX session_payment_reversal_origin_idx
    ON public.table_session_payment_transactions
    (related_transaction_id)
    WHERE transaction_type = 'reversal';


-- =========================================================
-- 3. PROTECCIÓN DEL HISTORIAL FINANCIERO
-- =========================================================

CREATE OR REPLACE FUNCTION public.prevent_financial_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
    RAISE EXCEPTION
        'El historial financiero es inmutable. Registra una reversión para corregir un movimiento.'
        USING ERRCODE = '55000';
END;
$function$;

CREATE TRIGGER session_payment_no_update_delete
BEFORE UPDATE OR DELETE
ON public.table_session_payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

CREATE TRIGGER session_payment_no_truncate
BEFORE TRUNCATE
ON public.table_session_payment_transactions
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

-- =========================================================
-- 4. RESUMEN FINANCIERO CALCULADO EN SERVIDOR
-- =========================================================

CREATE OR REPLACE FUNCTION public.waiter_session_account_summary(
    p_session_id uuid,
    p_restaurant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_dine_in numeric := 0;
    v_takeaway numeric := 0;
    v_payments numeric := 0;
    v_reversals numeric := 0;
    v_gross numeric := 0;
    v_balance numeric := 0;
    v_unresolved_prints integer := 0;
    v_confirmed_orders integer := 0;
    v_payment_history jsonb := '[]'::jsonb;
BEGIN
    SELECT
        COALESCE(SUM(total) FILTER (
            WHERE order_type = 'dine_in' AND status = 'confirmed'
        ), 0),
        COALESCE(SUM(total) FILTER (
            WHERE order_type = 'takeaway' AND status = 'confirmed'
        ), 0),
        COUNT(*) FILTER (WHERE status = 'confirmed')
    INTO v_dine_in, v_takeaway, v_confirmed_orders
    FROM public.service_orders
    WHERE table_session_id = p_session_id
      AND restaurant_id = p_restaurant_id;

    SELECT
        COALESCE(SUM(amount) FILTER (
            WHERE transaction_type = 'payment'
        ), 0),
        COALESCE(SUM(amount) FILTER (
            WHERE transaction_type = 'reversal'
        ), 0)
    INTO v_payments, v_reversals
    FROM public.table_session_payment_transactions
    WHERE session_id = p_session_id
      AND restaurant_id = p_restaurant_id;

    SELECT COUNT(*)::integer
    INTO v_unresolved_prints
    FROM public.print_jobs pj
    INNER JOIN public.service_orders so
        ON so.id = pj.service_order_id
    WHERE so.table_session_id = p_session_id
      AND so.restaurant_id = p_restaurant_id
      AND pj.status NOT IN ('printed', 'cancelled');

    v_gross := v_dine_in + v_takeaway;
    v_balance := v_gross - v_payments + v_reversals;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', h.id,
                'type', h.transaction_type,
                'method', h.payment_method,
                'amount', h.amount,
                'reference', h.reference,
                'reason', h.reason,
                'relatedTransactionId', h.related_transaction_id,
                'waiterId', h.waiter_id,
                'createdAt', h.created_at
            )
            ORDER BY h.created_at DESC
        ),
        '[]'::jsonb
    )
    INTO v_payment_history
    FROM public.table_session_payment_transactions h
    WHERE h.session_id = p_session_id
      AND h.restaurant_id = p_restaurant_id;

    RETURN jsonb_build_object(
        'sessionId', p_session_id,
        'dineInTotal', v_dine_in,
        'takeawayTotal', v_takeaway,
        'grossTotal', v_gross,
        'paymentsTotal', v_payments,
        'reversalsTotal', v_reversals,
        'netPaidTotal', v_payments - v_reversals,
        'balanceDue', v_balance,
        'confirmedOrdersCount', v_confirmed_orders,
        'unresolvedPrintJobs', v_unresolved_prints,
        'paymentHistory', v_payment_history
    );
END;
$function$;


-- =========================================================
-- 5. CONSULTA DE CUENTA: SOLO EL MESERO RESPONSABLE
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_waiter_session_account(
    p_session_id uuid,
    p_restaurant_id uuid,
    p_waiter_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_session public.table_sessions%ROWTYPE;
BEGIN
    SELECT *
    INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND opened_by_waiter_id = p_waiter_id
      AND status = 'open';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cuenta no existe, está cerrada o pertenece a otro mesero.'
            USING ERRCODE = '42501';
    END IF;

    RETURN public.waiter_session_account_summary(
        p_session_id,
        p_restaurant_id
    ) || jsonb_build_object(
        'status', v_session.status,
        'openedAt', v_session.opened_at
    );
END;
$function$;


-- =========================================================
-- 6. REGISTRO DE PAGOS: EFECTIVO O TRANSFERENCIA
-- =========================================================

CREATE OR REPLACE FUNCTION public.record_waiter_session_payment(
    p_session_id uuid,
    p_restaurant_id uuid,
    p_waiter_id uuid,
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
    v_session public.table_sessions%ROWTYPE;
    v_existing public.table_session_payment_transactions%ROWTYPE;
    v_summary jsonb;
    v_balance numeric;
    v_payment_id uuid;
    v_profile_id uuid;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0
       OR p_amount <> trunc(p_amount) THEN
        RAISE EXCEPTION 'El pago debe ser un importe positivo en pesos enteros.';
    END IF;

    IF p_payment_method IS NULL
       OR p_payment_method NOT IN ('cash', 'transfer') THEN
        RAISE EXCEPTION 'El medio de pago debe ser efectivo o transferencia.';
    END IF;

    IF p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'Falta la clave de seguridad del pago.';
    END IF;

    SELECT *
    INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id
      AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la cuenta de mesa.'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO v_existing
    FROM public.table_session_payment_transactions
    WHERE restaurant_id = p_restaurant_id
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_existing.session_id <> p_session_id
           OR v_existing.waiter_id <> p_waiter_id
           OR v_existing.transaction_type <> 'payment'
           OR v_existing.amount <> p_amount
           OR v_existing.payment_method <> p_payment_method
           OR v_existing.reference IS DISTINCT FROM NULLIF(btrim(p_reference), '') THEN
            RAISE EXCEPTION 'La clave de pago ya fue utilizada con otros datos.';
        END IF;

        RETURN public.waiter_session_account_summary(
            p_session_id, p_restaurant_id
        ) || jsonb_build_object(
            'paymentId', v_existing.id,
            'duplicate', true
        );
    END IF;

    SELECT wa.profile_id
    INTO v_profile_id
    FROM public.waiter_accounts wa
    JOIN public.profiles pr
      ON pr.id = wa.profile_id
     AND pr.role = 'waiter'
     AND pr.restaurant_id = wa.restaurant_id
    WHERE wa.id = p_waiter_id
      AND wa.restaurant_id = p_restaurant_id
      AND wa.status = 'active';

    IF NOT FOUND OR v_profile_id IS NULL THEN
        RAISE EXCEPTION 'La cuenta del mesero no está activa.'
            USING ERRCODE = '42501';
    END IF;

    IF v_session.status <> 'open'
       OR v_session.opened_by_waiter_id <> p_waiter_id THEN
        RAISE EXCEPTION 'La cuenta no está abierta o no pertenece a este mesero.'
            USING ERRCODE = '42501';
    END IF;

    v_summary := public.waiter_session_account_summary(
        p_session_id, p_restaurant_id
    );

    v_balance := (v_summary->>'balanceDue')::numeric;

    IF p_amount > v_balance THEN
        RAISE EXCEPTION 'El pago supera el saldo pendiente actual (%).', v_balance;
    END IF;

    INSERT INTO public.table_session_payment_transactions (
        restaurant_id,
        session_id,
        waiter_id,
        transaction_type,
        payment_method,
        amount,
        reference,
        idempotency_key
    )
    VALUES (
        p_restaurant_id,
        p_session_id,
        p_waiter_id,
        'payment',
        p_payment_method,
        p_amount,
        NULLIF(btrim(p_reference), ''),
        p_idempotency_key
    )
    RETURNING id INTO v_payment_id;

    INSERT INTO public.service_audit_logs (
        restaurant_id,
        actor_profile_id,
        actor_waiter_id,
        action,
        entity_type,
        entity_id,
        details
    )
    VALUES (
        p_restaurant_id,
        v_profile_id,
        p_waiter_id,
        'session_payment_recorded',
        'table_session_payment_transaction',
        v_payment_id,
        jsonb_build_object(
            'session_id', p_session_id,
            'amount', p_amount,
            'method', p_payment_method
        )
    );

    RETURN public.waiter_session_account_summary(
        p_session_id, p_restaurant_id
    ) || jsonb_build_object(
        'paymentId', v_payment_id,
        'duplicate', false
    );
END;
$function$;


-- 8. REVERSIÓN PARCIAL O TOTAL: SOLO ADMINISTRADOR
-- =========================================================

CREATE OR REPLACE FUNCTION public.reverse_waiter_session_payment(
    p_session_id uuid,
    p_restaurant_id uuid,
    p_waiter_id uuid,
    p_authorized_by_profile_id uuid,
    p_payment_id uuid,
    p_amount numeric,
    p_reason text,
    p_idempotency_key uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_session public.table_sessions%ROWTYPE;
    v_original public.table_session_payment_transactions%ROWTYPE;
    v_role text;
    v_admin_restaurant uuid;
    v_reversed_amount numeric(12,2);
    v_reversal_id uuid;
    v_existing public.table_session_payment_transactions%ROWTYPE;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0
       OR p_amount <> trunc(p_amount)
       OR NULLIF(btrim(p_reason), '') IS NULL
       OR p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'La reversión requiere un importe entero positivo, motivo y clave válida.';
    END IF;

    SELECT role, restaurant_id
    INTO v_role, v_admin_restaurant
    FROM public.profiles
    WHERE id = p_authorized_by_profile_id;

    IF NOT FOUND
       OR v_role <> 'restaurant_admin'
       OR (v_role = 'restaurant_admin'
           AND v_admin_restaurant IS DISTINCT FROM p_restaurant_id) THEN
        RAISE EXCEPTION 'La reversión requiere autorización de un administrador.'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id
      AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la cuenta de mesa.'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO v_existing
    FROM public.table_session_payment_transactions
    WHERE restaurant_id = p_restaurant_id
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_existing.session_id <> p_session_id
           OR v_existing.waiter_id <> p_waiter_id
           OR v_existing.transaction_type <> 'reversal'
           OR v_existing.related_transaction_id <> p_payment_id
           OR v_existing.amount <> p_amount
           OR v_existing.reason <> btrim(p_reason) THEN
            RAISE EXCEPTION 'La clave de reversión ya fue utilizada con otros datos.';
        END IF;

        RETURN public.waiter_session_account_summary(
            p_session_id, p_restaurant_id
        ) || jsonb_build_object(
            'reversalId', v_existing.id,
            'duplicate', true
        );
    END IF;

    IF v_session.status <> 'open'
       OR v_session.opened_by_waiter_id <> p_waiter_id THEN
        RAISE EXCEPTION 'La cuenta no está abierta o no pertenece a este mesero.'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO v_original
    FROM public.table_session_payment_transactions
    WHERE id = p_payment_id
      AND session_id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND waiter_id = p_waiter_id
      AND transaction_type = 'payment';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el pago original de esta cuenta.';
    END IF;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_reversed_amount
    FROM public.table_session_payment_transactions
    WHERE related_transaction_id = p_payment_id
      AND transaction_type = 'reversal';

    IF p_amount > v_original.amount - v_reversed_amount THEN
        RAISE EXCEPTION 'La reversión supera el importe que aún puede reversarse.';
    END IF;

    INSERT INTO public.table_session_payment_transactions (
        restaurant_id,
        session_id,
        waiter_id,
        transaction_type,
        payment_method,
        amount,
        reason,
        related_transaction_id,
        idempotency_key
    )
    VALUES (
        p_restaurant_id,
        p_session_id,
        p_waiter_id,
        'reversal',
        v_original.payment_method,
        p_amount,
        btrim(p_reason),
        p_payment_id,
        p_idempotency_key
    )
    RETURNING id INTO v_reversal_id;

    INSERT INTO public.service_audit_logs (
        restaurant_id,
        actor_profile_id,
        actor_waiter_id,
        action,
        entity_type,
        entity_id,
        details
    )
    VALUES (
        p_restaurant_id,
        p_authorized_by_profile_id,
        NULL,
        'session_payment_reversed',
        'table_session_payment_transaction',
        v_reversal_id,
        jsonb_build_object(
            'session_id', p_session_id,
            'original_payment_id', p_payment_id,
            'amount', p_amount,
            'reason', btrim(p_reason)
        )
    );

    RETURN public.waiter_session_account_summary(
        p_session_id, p_restaurant_id
    ) || jsonb_build_object(
        'reversalId', v_reversal_id,
        'duplicate', false
    );
END;
$function$;


-- 9. CIERRE TRANSACCIONAL DE LA CUENTA
-- =========================================================

CREATE OR REPLACE FUNCTION public.close_waiter_table_session(
    p_session_id uuid,
    p_restaurant_id uuid,
    p_waiter_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_session public.table_sessions%ROWTYPE;
    v_summary jsonb;
    v_profile_id uuid;
    v_balance numeric(12,2);
    v_unresolved_prints integer;
    v_unresolved_orders integer;
    v_order_count integer;
    v_new_status text;
BEGIN
    SELECT *
    INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id
      AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la cuenta de mesa.'
            USING ERRCODE = '42501';
    END IF;

    IF v_session.status IN ('paid', 'cancelled')
       AND v_session.closed_by_waiter_id = p_waiter_id THEN
        RETURN public.waiter_session_account_summary(
            p_session_id, p_restaurant_id
        ) || jsonb_build_object(
            'status', v_session.status,
            'closedAt', v_session.closed_at,
            'closedByWaiterId', v_session.closed_by_waiter_id,
            'duplicate', true
        );
    END IF;

    SELECT wa.profile_id
    INTO v_profile_id
    FROM public.waiter_accounts wa
    JOIN public.profiles pr
      ON pr.id = wa.profile_id
     AND pr.role = 'waiter'
     AND pr.restaurant_id = wa.restaurant_id
    WHERE wa.id = p_waiter_id
      AND wa.restaurant_id = p_restaurant_id
      AND wa.status = 'active';

    IF NOT FOUND OR v_profile_id IS NULL THEN
        RAISE EXCEPTION 'La cuenta del mesero no está activa.'
            USING ERRCODE = '42501';
    END IF;

    IF v_session.status <> 'open'
       OR v_session.opened_by_waiter_id <> p_waiter_id THEN
        RAISE EXCEPTION 'La cuenta no está abierta o no pertenece a este mesero.'
            USING ERRCODE = '42501';
    END IF;

    v_summary := public.waiter_session_account_summary(
        p_session_id, p_restaurant_id
    );

    v_balance := (v_summary->>'balanceDue')::numeric;
    v_unresolved_prints := (v_summary->>'unresolvedPrintJobs')::integer;
    v_order_count := (v_summary->>'confirmedOrdersCount')::integer;

    SELECT COUNT(*)::integer
    INTO v_unresolved_orders
    FROM public.service_orders
    WHERE table_session_id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND status NOT IN ('confirmed', 'cancelled');

    IF v_balance <> 0 THEN
        RAISE EXCEPTION 'No se puede cerrar: saldo pendiente de %.', v_balance;
    END IF;

    IF v_unresolved_orders > 0 THEN
        RAISE EXCEPTION 'No se puede cerrar: hay % pedidos sin resolver.',
            v_unresolved_orders;
    END IF;

    IF v_unresolved_prints > 0 THEN
        RAISE EXCEPTION
            'No se puede cerrar: hay % trabajos de impresión sin resolver.',
            v_unresolved_prints;
    END IF;

    v_new_status := CASE
        WHEN v_order_count = 0 THEN 'cancelled'
        ELSE 'paid'
    END;

    UPDATE public.table_sessions
    SET
        status = v_new_status,
        closed_by_waiter_id = p_waiter_id,
        closed_at = now(),
        close_reason = CASE
            WHEN v_new_status = 'cancelled'
                THEN 'Cuenta cerrada sin pedidos confirmados.'
            ELSE 'Cuenta pagada y cerrada por el mesero responsable.'
        END
    WHERE id = p_session_id
      AND restaurant_id = p_restaurant_id;

    INSERT INTO public.service_audit_logs (
        restaurant_id,
        actor_profile_id,
        actor_waiter_id,
        action,
        entity_type,
        entity_id,
        details
    )
    VALUES (
        p_restaurant_id,
        v_profile_id,
        p_waiter_id,
        'table_session_closed',
        'table_session',
        p_session_id,
        jsonb_build_object(
            'status', v_new_status,
            'gross_total', v_summary->'grossTotal',
            'net_paid_total', v_summary->'netPaidTotal'
        )
    );

    RETURN v_summary || jsonb_build_object(
        'status', v_new_status,
        'closedAt', now(),
        'closedByWaiterId', p_waiter_id
    );
END;
$function$;


-- =========================================================
-- 10. PERMISOS: SOLO SERVICE_ROLE
-- =========================================================

ALTER TABLE public.table_session_payment_transactions ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
    public.table_session_payment_transactions
FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
    public.table_session_payment_transactions
TO service_role;

REVOKE ALL ON FUNCTION public.prevent_financial_ledger_mutation()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.waiter_session_account_summary(uuid, uuid)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_waiter_session_account(uuid, uuid, uuid)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.record_waiter_session_payment(
    uuid, uuid, uuid, numeric, text, text, uuid
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.reverse_waiter_session_payment(
    uuid, uuid, uuid, uuid, uuid, numeric, text, uuid
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.close_waiter_table_session(
    uuid, uuid, uuid
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.waiter_session_account_summary(uuid, uuid)
TO service_role;

GRANT EXECUTE ON FUNCTION public.get_waiter_session_account(uuid, uuid, uuid)
TO service_role;

GRANT EXECUTE ON FUNCTION public.record_waiter_session_payment(
    uuid, uuid, uuid, numeric, text, text, uuid
) TO service_role;

GRANT EXECUTE ON FUNCTION public.reverse_waiter_session_payment(
    uuid, uuid, uuid, uuid, uuid, numeric, text, uuid
) TO service_role;

GRANT EXECUTE ON FUNCTION public.close_waiter_table_session(
    uuid, uuid, uuid
) TO service_role;

COMMIT;
