BEGIN;

CREATE OR REPLACE FUNCTION public.create_restaurant_fixed_table()
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
    v_candidate_label text;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión.' USING ERRCODE = '28000';
    END IF;

    SELECT p.restaurant_id INTO v_restaurant_id
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'restaurant_admin';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo el administrador del restaurante puede crear mesas fijas.'
            USING ERRCODE = '42501';
    END IF;

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

    IF v_existing_count >= 200 THEN
        RAISE EXCEPTION 'Se alcanzó el límite técnico de 200 mesas registradas.'
            USING ERRCODE = '23514';
    END IF;

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
        NULL
    )
    RETURNING
        restaurant_tables.id,
        restaurant_tables.table_number,
        restaurant_tables.label,
        restaurant_tables.is_active;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deactivate_restaurant_fixed_table(
    p_table_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_restaurant_id uuid;
    v_table_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión.' USING ERRCODE = '28000';
    END IF;

    SELECT p.restaurant_id INTO v_restaurant_id
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'restaurant_admin';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo el administrador del restaurante puede retirar mesas fijas.'
            USING ERRCODE = '42501';
    END IF;

    PERFORM 1
    FROM public.restaurants r
    WHERE r.id = v_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el restaurante.';
    END IF;

    SELECT rt.id INTO v_table_id
    FROM public.restaurant_tables rt
    WHERE rt.id = p_table_id
      AND rt.restaurant_id = v_restaurant_id
      AND rt.temporary_until IS NULL
      AND rt.is_active = true
    FOR UPDATE;

    IF v_table_id IS NULL THEN
        RAISE EXCEPTION 'La mesa fija no existe o ya está retirada.'
            USING ERRCODE = 'P0002';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.table_sessions ts
        WHERE ts.restaurant_id = v_restaurant_id
          AND ts.restaurant_table_id = v_table_id
          AND ts.status = 'open'
    ) THEN
        RAISE EXCEPTION 'No se puede retirar una mesa que tiene una cuenta abierta.'
            USING ERRCODE = '23514';
    END IF;

    UPDATE public.restaurant_tables
    SET is_active = false
    WHERE id = v_table_id
      AND restaurant_id = v_restaurant_id;

    RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_restaurant_fixed_table() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_restaurant_fixed_table() FROM anon;
GRANT EXECUTE ON FUNCTION public.create_restaurant_fixed_table() TO authenticated;

REVOKE ALL ON FUNCTION public.deactivate_restaurant_fixed_table(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.deactivate_restaurant_fixed_table(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.deactivate_restaurant_fixed_table(uuid) TO authenticated;

COMMIT;
