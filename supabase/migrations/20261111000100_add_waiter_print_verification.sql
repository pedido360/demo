BEGIN;

ALTER TABLE public.print_jobs
  ADD COLUMN verified_by_waiter_id uuid,
  ADD COLUMN verified_at timestamptz,
  ADD CONSTRAINT print_jobs_verification_fields_check
    CHECK (
      (verified_by_waiter_id IS NULL AND verified_at IS NULL)
      OR
      (verified_by_waiter_id IS NOT NULL AND verified_at IS NOT NULL)
    ),
  ADD CONSTRAINT print_jobs_verified_waiter_restaurant_fk
    FOREIGN KEY (verified_by_waiter_id, restaurant_id)
    REFERENCES public.waiter_accounts(id, restaurant_id)
    ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION public.verify_waiter_print_job(
  p_job_id uuid,
  p_restaurant_id uuid,
  p_waiter_id uuid,
  p_profile_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_waiter public.waiter_accounts%ROWTYPE;
  v_job public.print_jobs%ROWTYPE;
  v_verified_at timestamptz;
BEGIN
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id
    AND role = 'waiter'
    AND restaurant_id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El perfil no corresponde a un mesero de este restaurante.'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_waiter
  FROM public.waiter_accounts
  WHERE id = p_waiter_id
    AND profile_id = p_profile_id
    AND restaurant_id = p_restaurant_id
    AND status = 'active'
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La cuenta del mesero no está activa o no corresponde al perfil.'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job
  FROM public.print_jobs
  WHERE id = p_job_id
    AND restaurant_id = p_restaurant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El trabajo de impresión no pertenece a este restaurante.'
      USING ERRCODE = '42501';
  END IF;

  IF v_job.status <> 'printed' THEN
    RAISE EXCEPTION 'Solo se pueden verificar trabajos completados por CUPS.';
  END IF;

  IF v_job.verified_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este trabajo de impresión ya fue verificado.';
  END IF;

  v_verified_at := now();

  UPDATE public.print_jobs
  SET verified_by_waiter_id = p_waiter_id,
      verified_at = v_verified_at,
      updated_at = v_verified_at
  WHERE id = p_job_id
    AND restaurant_id = p_restaurant_id
    AND status = 'printed'
    AND verified_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No fue posible registrar la verificación del trabajo.';
  END IF;

  INSERT INTO public.service_audit_logs
    (restaurant_id, actor_profile_id, actor_waiter_id, action, entity_type, entity_id, details)
  VALUES (
    p_restaurant_id,
    p_profile_id,
    p_waiter_id,
    'print_job_physically_verified',
    'print_job',
    p_job_id,
    jsonb_build_object(
      'service_order_id', v_job.service_order_id,
      'destination', v_job.destination,
      'verified_at', v_verified_at
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'job_id', p_job_id,
    'verified_at', v_verified_at,
    'message', 'Verificación física de impresión registrada.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_waiter_print_job(uuid, uuid, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_waiter_print_job(uuid, uuid, uuid, uuid)
  TO service_role;

-- Resumen actualizado: printed solo se resuelve con verificación física.

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
      AND (
          pj.status NOT IN ('printed', 'cancelled')
          OR (pj.status = 'printed' AND pj.verified_at IS NULL)
      );

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

COMMIT;
