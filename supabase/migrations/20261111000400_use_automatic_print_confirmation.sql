BEGIN;

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

COMMIT;
