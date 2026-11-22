create table if not exists public.independent_order_deliveries (
    order_id uuid primary key
        references public.service_orders(id) on delete restrict,
    restaurant_id uuid not null
        references public.restaurants(id) on delete restrict,
    delivered_by_profile_id uuid
        references public.profiles(id) on delete restrict,
    delivered_at timestamptz not null default now()
);

create index if not exists independent_order_deliveries_restaurant_date_idx
    on public.independent_order_deliveries (restaurant_id, delivered_at desc);

alter table public.independent_order_deliveries enable row level security;

revoke all on public.independent_order_deliveries from anon, authenticated;
grant all on public.independent_order_deliveries to service_role;

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
    v_net_paid numeric(12,2);
    v_verified_total numeric(12,2);
    v_prints_ready boolean;
    v_delivered_at timestamptz;
    v_delivered boolean := false;
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

    SELECT
        COALESCE(SUM(
            CASE
                WHEN transaction_type = 'payment' THEN amount
                ELSE -amount
            END
        ), 0)
    INTO v_net_paid
    FROM public.independent_order_payment_transactions
    WHERE order_id = p_order_id;

    SELECT COALESCE(SUM(verified_amount), 0)
    INTO v_verified_total
    FROM public.independent_order_payment_verifications
    WHERE order_id = p_order_id;

    SELECT
        COUNT(*) = 2
        AND COUNT(*) FILTER (
            WHERE destination = 'cashier' AND status = 'printed'
        ) = 1
        AND COUNT(*) FILTER (
            WHERE destination = 'kitchen' AND status = 'printed'
        ) = 1
    INTO v_prints_ready
    FROM public.print_jobs
    WHERE service_order_id = p_order_id
      AND restaurant_id = v_profile.restaurant_id;

    IF v_order.status = 'confirmed'
       AND v_order.total > 0
       AND v_net_paid >= v_order.total
       AND v_verified_total >= v_net_paid
       AND v_prints_ready THEN

        INSERT INTO public.independent_order_deliveries (
            order_id, restaurant_id, delivered_by_profile_id
        ) VALUES (
            p_order_id, v_profile.restaurant_id, auth.uid()
        )
        ON CONFLICT (order_id) DO NOTHING
        RETURNING delivered_at INTO v_delivered_at;

        IF FOUND THEN
            INSERT INTO public.service_audit_logs (
                restaurant_id, actor_profile_id, action,
                entity_type, entity_id, details
            ) VALUES (
                v_profile.restaurant_id, auth.uid(),
                'independent_takeaway_delivered',
                'service_order', p_order_id,
                jsonb_build_object(
                    'delivered_at', v_delivered_at,
                    'net_paid', v_net_paid,
                    'verified_total', v_verified_total
                )
            );
            v_delivered := true;
        ELSE
            SELECT delivered_at INTO v_delivered_at
            FROM public.independent_order_deliveries
            WHERE order_id = p_order_id;
            v_delivered := FOUND;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'verificationId', v_verified.id,
        'verifiedAmount', v_verified.verified_amount,
        'verifiedAt', v_verified.verified_at,
        'delivered', v_delivered,
        'deliveredAt', v_delivered_at
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.verify_independent_takeaway_payment(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_independent_takeaway_payment(uuid, uuid, text)
TO authenticated;
