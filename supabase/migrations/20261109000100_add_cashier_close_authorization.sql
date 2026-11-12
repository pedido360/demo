BEGIN;

CREATE TABLE public.cashier_payment_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL,
    session_id uuid NOT NULL,
    transaction_id uuid NOT NULL UNIQUE,
    verified_by_profile_id uuid NOT NULL REFERENCES public.profiles(id),
    verified_amount numeric(12,2) NOT NULL CHECK (verified_amount > 0 AND verified_amount = trunc(verified_amount)),
    verified_at timestamptz NOT NULL DEFAULT now(),
    notes text,
    FOREIGN KEY (transaction_id, session_id, restaurant_id)
      REFERENCES public.table_session_payment_transactions(id, session_id, restaurant_id),
    FOREIGN KEY (session_id, restaurant_id)
      REFERENCES public.table_sessions(id, restaurant_id)
);

CREATE TRIGGER cashier_payment_verifications_immutable
BEFORE UPDATE OR DELETE ON public.cashier_payment_verifications
FOR EACH ROW EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

CREATE TRIGGER cashier_payment_verifications_no_truncate
BEFORE TRUNCATE ON public.cashier_payment_verifications
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

ALTER TABLE public.cashier_payment_verifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cashier_payment_verifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.cashier_payment_verifications TO service_role;

CREATE TABLE public.table_session_close_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL,
    session_id uuid NOT NULL,
    requested_by_waiter_id uuid NOT NULL REFERENCES public.waiter_accounts(id),
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'returned', 'approved')),
    requested_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by_profile_id uuid REFERENCES public.profiles(id),
    reviewed_at timestamptz,
    return_reason text,
    approved_at timestamptz,
    FOREIGN KEY (session_id, restaurant_id)
      REFERENCES public.table_sessions(id, restaurant_id),
    CHECK (
      (status = 'pending' AND reviewed_by_profile_id IS NULL
       AND reviewed_at IS NULL AND return_reason IS NULL AND approved_at IS NULL)
      OR
      (status = 'returned' AND reviewed_by_profile_id IS NOT NULL
       AND reviewed_at IS NOT NULL AND return_reason IS NOT NULL
       AND length(btrim(return_reason)) > 0 AND approved_at IS NULL)
      OR
      (status = 'approved' AND reviewed_by_profile_id IS NOT NULL
       AND reviewed_at IS NOT NULL AND approved_at IS NOT NULL)
    )
);

CREATE UNIQUE INDEX table_session_close_one_pending_idx
ON public.table_session_close_requests(session_id) WHERE status = 'pending';

CREATE INDEX table_session_close_history_idx
ON public.table_session_close_requests(session_id, requested_at DESC);

ALTER TABLE public.table_session_close_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.table_session_close_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.table_session_close_requests TO service_role;

REVOKE ALL ON FUNCTION public.close_waiter_table_session(uuid, uuid, uuid)
FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.request_waiter_table_session_close(
    p_session_id uuid,
    p_restaurant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_waiter_id uuid;
    v_session public.table_sessions%ROWTYPE;
    v_summary jsonb;
    v_unresolved integer;
    v_verified numeric(12,2);
    v_request_id uuid;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'waiter'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
      RAISE EXCEPTION 'Solo el mesero responsable puede solicitar el cierre.'
        USING ERRCODE = '42501';
    END IF;

    SELECT id INTO v_waiter_id
    FROM public.waiter_accounts
    WHERE profile_id = auth.uid()
      AND restaurant_id = p_restaurant_id
      AND status = 'active';

    IF v_waiter_id IS NULL THEN
      RAISE EXCEPTION 'La cuenta del mesero no está activa.';
    END IF;

    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND OR v_session.status <> 'open'
       OR v_session.opened_by_waiter_id <> v_waiter_id THEN
      RAISE EXCEPTION 'La mesa no está abierta a nombre de este mesero.'
        USING ERRCODE = '42501';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.table_session_close_requests
      WHERE session_id = p_session_id AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'Esta mesa ya tiene una solicitud pendiente de Caja.';
    END IF;

    v_summary := public.waiter_session_account_summary(p_session_id, p_restaurant_id);

    SELECT COUNT(*)::integer INTO v_unresolved
    FROM public.service_orders
    WHERE table_session_id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND status NOT IN ('confirmed', 'cancelled');

    SELECT COALESCE(SUM(
      v.verified_amount - COALESCE((
        SELECT SUM(r.amount)
        FROM public.table_session_payment_transactions r
        WHERE r.related_transaction_id = v.transaction_id
          AND r.transaction_type = 'reversal'
          AND r.created_at > v.verified_at
      ), 0)
    ), 0)
    INTO v_verified
    FROM public.cashier_payment_verifications v
    WHERE v.session_id = p_session_id AND v.restaurant_id = p_restaurant_id;

    IF COALESCE((v_summary->>'balanceDue')::numeric, 0) <> 0
       OR COALESCE((v_summary->>'unresolvedPrintJobs')::integer, 0) <> 0
       OR v_unresolved <> 0
       OR v_verified <> COALESCE((v_summary->>'netPaidTotal')::numeric, 0) THEN
      RAISE EXCEPTION 'No se puede solicitar el cierre: revisa saldo, pagos verificados, pedidos e impresión.';
    END IF;

    INSERT INTO public.table_session_close_requests
      (restaurant_id, session_id, requested_by_waiter_id)
    VALUES (p_restaurant_id, p_session_id, v_waiter_id)
    RETURNING id INTO v_request_id;

    INSERT INTO public.service_audit_logs
      (restaurant_id, actor_profile_id, actor_waiter_id, action, entity_type, entity_id, details)
    VALUES (p_restaurant_id, auth.uid(), v_waiter_id, 'table_close_requested',
      'table_session_close_request', v_request_id,
      jsonb_build_object('session_id', p_session_id));

    RETURN jsonb_build_object('success', true, 'requestId', v_request_id,
      'message', 'Solicitud enviada a Caja. La mesa continúa ocupada.');
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_cashier_session_payment(
    p_transaction_id uuid,
    p_session_id uuid,
    p_restaurant_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_session public.table_sessions%ROWTYPE;
    v_payment public.table_session_payment_transactions%ROWTYPE;
    v_reversed numeric(12,2);
    v_remaining numeric(12,2);
    v_verification_id uuid;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
      RAISE EXCEPTION 'Solo Caja del restaurante puede verificar pagos.'
        USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND OR v_session.status <> 'open' THEN
      RAISE EXCEPTION 'La cuenta no está abierta.';
    END IF;

    SELECT * INTO v_payment
    FROM public.table_session_payment_transactions
    WHERE id = p_transaction_id
      AND session_id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND transaction_type = 'payment'
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró el pago de esta cuenta.'; END IF;

    IF EXISTS (
      SELECT 1 FROM public.cashier_payment_verifications
      WHERE transaction_id = p_transaction_id
    ) THEN
      RAISE EXCEPTION 'Este pago ya fue verificado por Caja.';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_reversed
    FROM public.table_session_payment_transactions
    WHERE related_transaction_id = p_transaction_id
      AND transaction_type = 'reversal';

    v_remaining := v_payment.amount - v_reversed;
    IF v_remaining <= 0 THEN
      RAISE EXCEPTION 'El pago fue reversado completamente.';
    END IF;

    INSERT INTO public.cashier_payment_verifications
      (restaurant_id, session_id, transaction_id, verified_by_profile_id, verified_amount, notes)
    VALUES (p_restaurant_id, p_session_id, p_transaction_id, auth.uid(),
      v_remaining, NULLIF(btrim(p_notes), ''))
    RETURNING id INTO v_verification_id;

    INSERT INTO public.service_audit_logs
      (restaurant_id, actor_profile_id, actor_waiter_id, action, entity_type, entity_id, details)
    VALUES (p_restaurant_id, auth.uid(), NULL, 'cashier_payment_verified',
      'cashier_payment_verification', v_verification_id,
      jsonb_build_object('session_id', p_session_id,
        'transaction_id', p_transaction_id, 'verified_amount', v_remaining));

    RETURN jsonb_build_object('success', true,
      'verificationId', v_verification_id, 'verifiedAmount', v_remaining);
END;
$$;

CREATE OR REPLACE FUNCTION public.return_waiter_table_session_close(
    p_session_id uuid,
    p_restaurant_id uuid,
    p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_request public.table_session_close_requests%ROWTYPE;
BEGIN
    IF NULLIF(btrim(p_reason), '') IS NULL THEN
      RAISE EXCEPTION 'Debes indicar el motivo de devolución.';
    END IF;

    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
      RAISE EXCEPTION 'Solo Caja puede devolver una solicitud.';
    END IF;

    PERFORM 1 FROM public.table_sessions
    WHERE id = p_session_id AND restaurant_id = p_restaurant_id AND status = 'open'
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'La cuenta ya no está abierta.'; END IF;

    SELECT * INTO v_request
    FROM public.table_session_close_requests
    WHERE session_id = p_session_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'No hay una solicitud pendiente para esta mesa.'; END IF;

    UPDATE public.table_session_close_requests
    SET status = 'returned', reviewed_by_profile_id = auth.uid(),
        reviewed_at = now(), return_reason = btrim(p_reason)
    WHERE id = v_request.id;

    INSERT INTO public.service_audit_logs
      (restaurant_id, actor_profile_id, actor_waiter_id, action, entity_type, entity_id, details)
    VALUES (p_restaurant_id, auth.uid(), NULL, 'table_close_returned',
      'table_session_close_request', v_request.id,
      jsonb_build_object('session_id', p_session_id, 'reason', btrim(p_reason)));

    RETURN jsonb_build_object('success', true, 'message', 'Solicitud devuelta a revisión.');
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_waiter_table_session_close(
    p_session_id uuid,
    p_restaurant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_session public.table_sessions%ROWTYPE;
    v_request public.table_session_close_requests%ROWTYPE;
    v_summary jsonb;
    v_unresolved integer;
    v_verified numeric(12,2);
    v_closed_status text;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

    IF NOT FOUND OR v_profile.role <> 'restaurant_admin'
       OR v_profile.restaurant_id IS DISTINCT FROM p_restaurant_id THEN
      RAISE EXCEPTION 'Solo Caja puede autorizar el cierre.';
    END IF;

    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE id = p_session_id AND restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND OR v_session.status <> 'open' THEN
      RAISE EXCEPTION 'La cuenta no está abierta.';
    END IF;

    SELECT * INTO v_request
    FROM public.table_session_close_requests
    WHERE session_id = p_session_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND OR v_request.requested_by_waiter_id <> v_session.opened_by_waiter_id THEN
      RAISE EXCEPTION 'No existe una solicitud válida del mesero responsable.';
    END IF;

    v_summary := public.waiter_session_account_summary(p_session_id, p_restaurant_id);

    SELECT COUNT(*)::integer INTO v_unresolved
    FROM public.service_orders
    WHERE table_session_id = p_session_id
      AND restaurant_id = p_restaurant_id
      AND status NOT IN ('confirmed', 'cancelled');

    SELECT COALESCE(SUM(
      v.verified_amount - COALESCE((
        SELECT SUM(r.amount)
        FROM public.table_session_payment_transactions r
        WHERE r.related_transaction_id = v.transaction_id
          AND r.transaction_type = 'reversal'
          AND r.created_at > v.verified_at
      ), 0)
    ), 0)
    INTO v_verified
    FROM public.cashier_payment_verifications v
    WHERE v.session_id = p_session_id AND v.restaurant_id = p_restaurant_id;

    IF COALESCE((v_summary->>'balanceDue')::numeric, 0) <> 0
       OR COALESCE((v_summary->>'unresolvedPrintJobs')::integer, 0) <> 0
       OR v_unresolved <> 0
       OR v_verified <> COALESCE((v_summary->>'netPaidTotal')::numeric, 0) THEN
      RAISE EXCEPTION 'Cierre bloqueado: verifica dinero recibido y resuelve saldo, pedidos e impresión.';
    END IF;

    v_closed_status := CASE
      WHEN COALESCE((v_summary->>'confirmedOrdersCount')::integer, 0) > 0
      THEN 'paid' ELSE 'cancelled'
    END;

    UPDATE public.table_sessions
    SET status = v_closed_status,
        closed_by_waiter_id = v_session.opened_by_waiter_id,
        closed_at = now(),
        close_reason = 'Cierre autorizado por Caja'
    WHERE id = p_session_id AND restaurant_id = p_restaurant_id;

    UPDATE public.table_session_close_requests
    SET status = 'approved', reviewed_by_profile_id = auth.uid(),
        reviewed_at = now(), approved_at = now()
    WHERE id = v_request.id;

    INSERT INTO public.service_audit_logs
      (restaurant_id, actor_profile_id, actor_waiter_id, action, entity_type, entity_id, details)
    VALUES (p_restaurant_id, auth.uid(), NULL, 'table_close_approved',
      'table_session_close_request', v_request.id,
      jsonb_build_object('session_id', p_session_id, 'closed_status', v_closed_status));

    RETURN jsonb_build_object('success', true, 'status', v_closed_status,
      'message', 'Caja autorizó el cierre y la mesa quedó liberada.');
END;
$$;

REVOKE ALL ON FUNCTION public.request_waiter_table_session_close(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.verify_cashier_session_payment(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.return_waiter_table_session_close(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.approve_waiter_table_session_close(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.request_waiter_table_session_close(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cashier_session_payment(uuid, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.return_waiter_table_session_close(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_waiter_table_session_close(uuid, uuid) TO authenticated;

COMMIT;
