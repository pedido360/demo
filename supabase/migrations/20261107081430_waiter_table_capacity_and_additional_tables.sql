
BEGIN;

ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS max_tables integer NOT NULL DEFAULT 6;

-- Normaliza los máximos existentes antes de imponer el límite técnico.
-- Ningún restaurante puede tener menos capacidad que sus mesas registradas.
UPDATE public.restaurants r
SET max_tables = GREATEST(
    1,
    LEAST(
        200,
        GREATEST(
            r.max_tables,
            (SELECT COUNT(*)::integer
             FROM public.restaurant_tables rt
             WHERE rt.restaurant_id = r.id)
        )
    )
);

ALTER TABLE public.restaurants
DROP CONSTRAINT IF EXISTS restaurants_max_tables_positive;

ALTER TABLE public.restaurants
ADD CONSTRAINT restaurants_max_tables_positive
CHECK (max_tables BETWEEN 1 AND 200);

-- Sabores Demo 360: 6 mesas actuales + 9 adicionales.
UPDATE public.restaurants
SET max_tables = 15, updated_at = now()
WHERE id = '512f6a5b-e169-4e7a-b3a2-30f0b9b5a0cd';

-- Solo el administrador del restaurante puede cambiar su capacidad.
CREATE OR REPLACE FUNCTION public.set_restaurant_max_tables(
    p_max_tables integer
)
RETURNS TABLE (
    max_tables integer,
    existing_tables integer,
    available_slots integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_restaurant_id uuid;
    v_existing_count integer;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión.'
            USING ERRCODE = '28000';
    END IF;

    IF p_max_tables IS NULL OR p_max_tables < 1 OR p_max_tables > 200 THEN
        RAISE EXCEPTION 'El máximo debe estar entre 1 y 200 mesas.'
            USING ERRCODE = '22023';
    END IF;

    SELECT p.restaurant_id INTO v_restaurant_id
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'restaurant_admin';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Solo el administrador del restaurante puede cambiar el máximo.'
            USING ERRCODE = '42501';
    END IF;

    PERFORM 1
    FROM public.restaurants r
    WHERE r.id = v_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el restaurante.';
    END IF;

    SELECT COUNT(*)::integer INTO v_existing_count
    FROM public.restaurant_tables rt
    WHERE rt.restaurant_id = v_restaurant_id;

    IF p_max_tables < v_existing_count THEN
        RAISE EXCEPTION 'El máximo no puede ser inferior a las % mesas registradas.',
            v_existing_count USING ERRCODE = '23514';
    END IF;

    UPDATE public.restaurants
    SET max_tables = p_max_tables,
        updated_at = now()
    WHERE id = v_restaurant_id;

    RETURN QUERY
    SELECT p_max_tables,
           v_existing_count,
           p_max_tables - v_existing_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_restaurant_max_tables(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_restaurant_max_tables(integer) FROM anon;
REVOKE ALL ON FUNCTION public.set_restaurant_max_tables(integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_restaurant_max_tables(integer) TO authenticated;
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
    v_max_tables integer;
    v_existing_count integer;
    v_next_number integer;
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
        SELECT 1 FROM public.waiter_accounts wa
        WHERE wa.profile_id = v_user_id
          AND wa.restaurant_id = v_restaurant_id
          AND wa.status = 'active'
    ) THEN
        RAISE EXCEPTION 'La cuenta de mesero no está activa.'
        USING ERRCODE = '42501';
    END IF;

    -- Serializa las creaciones del mismo restaurante.
    SELECT r.max_tables INTO v_max_tables
    FROM public.restaurants r
    WHERE r.id = v_restaurant_id
    FOR UPDATE;

    IF v_max_tables IS NULL THEN
        RAISE EXCEPTION 'No se encontró la configuración del restaurante.';
    END IF;

    -- Incluye mesas inactivas para conservar números e historial.
    SELECT COUNT(*)::integer,
           COALESCE(MAX(rt.table_number), 0) + 1
    INTO v_existing_count, v_next_number
    FROM public.restaurant_tables rt
    WHERE rt.restaurant_id = v_restaurant_id;

    IF v_existing_count >= v_max_tables THEN
        RAISE EXCEPTION 'Se alcanzó el máximo autorizado de % mesas.',
            v_max_tables USING ERRCODE = '23514';
    END IF;

    -- Evita colisiones con números y etiquetas de mesas personalizadas.
    LOOP
        EXIT WHEN NOT EXISTS (
            SELECT 1
            FROM public.restaurant_tables rt
            WHERE rt.restaurant_id = v_restaurant_id
              AND (
                  rt.table_number = v_next_number
                  OR lower(rt.label) = lower('Mesa ' || v_next_number::text)
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
        restaurant_id, table_number, label,
        is_custom, is_active, sort_order
    )
    VALUES (
        v_restaurant_id, v_next_number,
        'Mesa ' || v_next_number::text,
        false, true, v_next_number
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
