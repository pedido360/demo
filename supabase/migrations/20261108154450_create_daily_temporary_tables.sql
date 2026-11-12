BEGIN;

CREATE OR REPLACE FUNCTION public.add_waiter_restaurant_table()
RETURNS TABLE (
    id uuid,
    table_number integer,
    label text,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_restaurant_id uuid;
    v_existing_count integer;
    v_next_number integer;
    v_today date := (now() AT TIME ZONE 'America/Bogota')::date;
    v_candidate_label text;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión.' USING ERRCODE = '28000';
    END IF;

    SELECT p.restaurant_id INTO v_restaurant_id
    FROM public.profiles p
    WHERE p.id = v_user_id AND p.role = 'waiter';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo un mesero puede agregar mesas.'
            USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.waiter_accounts wa
        WHERE wa.profile_id = v_user_id
          AND wa.restaurant_id = v_restaurant_id
          AND wa.status = 'active'
    ) THEN
        RAISE EXCEPTION 'La cuenta de mesero no está activa.'
            USING ERRCODE = '42501';
    END IF;

    -- Serializa las creaciones y cuenta también las mesas históricas.
    PERFORM 1
    FROM public.restaurants r
    WHERE r.id = v_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el restaurante.';
    END IF;

    SELECT COUNT(*)::integer,
           COALESCE(MAX(rt.table_number), 0) + 1
    INTO v_existing_count, v_next_number
    FROM public.restaurant_tables rt
    WHERE rt.restaurant_id = v_restaurant_id;

    -- Límite técnico de registros, no de mesas permanentes.
    IF v_existing_count >= 200 THEN
        RAISE EXCEPTION 'Se alcanzó el límite técnico de 200 mesas registradas.'
            USING ERRCODE = '23514';
    END IF;

    -- No reutiliza números ni etiquetas de mesas históricas.
    LOOP
        v_candidate_label := 'Mesa ' || v_next_number::text;

        EXIT WHEN NOT EXISTS (
            SELECT 1
            FROM public.restaurant_tables rt
            WHERE rt.restaurant_id = v_restaurant_id
              AND (
                  rt.table_number = v_next_number
                  OR lower(rt.label) = lower(v_candidate_label)
              )
        );

        IF v_next_number = 2147483647 THEN
            RAISE EXCEPTION 'No hay más números de mesa disponibles.'
                USING ERRCODE = '22003';
        END IF;

        v_next_number := v_next_number + 1;
    END LOOP;

    RETURN QUERY
    INSERT INTO public.restaurant_tables (
        restaurant_id,
        table_number,
        label,
        is_custom,
        is_active,
        sort_order,
        temporary_until
    )
    VALUES (
        v_restaurant_id,
        v_next_number,
        v_candidate_label,
        false,
        true,
        v_next_number,
        v_today
    )
    RETURNING
        public.restaurant_tables.id,
        public.restaurant_tables.table_number,
        public.restaurant_tables.label,
        public.restaurant_tables.is_active;
END;
$function$;

REVOKE ALL ON FUNCTION public.add_waiter_restaurant_table() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_waiter_restaurant_table() FROM anon;
REVOKE ALL ON FUNCTION public.add_waiter_restaurant_table() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.add_waiter_restaurant_table() TO authenticated;

COMMIT;
