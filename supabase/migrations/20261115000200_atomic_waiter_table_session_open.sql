BEGIN;

CREATE OR REPLACE FUNCTION public.open_waiter_table_session(
    p_table_id uuid
)
RETURNS TABLE (
    id uuid,
    restaurant_table_id uuid,
    status text,
    opened_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_restaurant_id uuid;
    v_waiter_id uuid;
    v_table public.restaurant_tables%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión.'
            USING ERRCODE = '28000';
    END IF;

    SELECT p.restaurant_id
    INTO v_restaurant_id
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'waiter';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'No tienes autorización para abrir cuentas.'
            USING ERRCODE = '42501';
    END IF;

    SELECT wa.id
    INTO v_waiter_id
    FROM public.waiter_accounts wa
    WHERE wa.profile_id = v_user_id
      AND wa.restaurant_id = v_restaurant_id
      AND wa.status = 'active';

    IF v_waiter_id IS NULL THEN
        RAISE EXCEPTION 'La cuenta del mesero está inactiva o no pertenece a este restaurante.'
            USING ERRCODE = '42501';
    END IF;

    PERFORM 1
    FROM public.restaurants r
    WHERE r.id = v_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el restaurante.';
    END IF;

    SELECT rt.*
    INTO v_table
    FROM public.restaurant_tables rt
    WHERE rt.id = p_table_id
      AND rt.restaurant_id = v_restaurant_id
    FOR UPDATE;

    IF NOT FOUND OR NOT v_table.is_active THEN
        RAISE EXCEPTION 'La mesa no existe o está inactiva.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_table.temporary_until IS NOT NULL
       AND v_table.temporary_until <
           (now() AT TIME ZONE 'America/Bogota')::date THEN
        RAISE EXCEPTION 'Esta mesa temporal ya venció y no puede recibir nuevas cuentas.'
            USING ERRCODE = '23514';
    END IF;

    RETURN QUERY
    INSERT INTO public.table_sessions (
        restaurant_id,
        restaurant_table_id,
        opened_by_waiter_id,
        status
    )
    VALUES (
        v_restaurant_id,
        v_table.id,
        v_waiter_id,
        'open'
    )
    RETURNING
        table_sessions.id,
        table_sessions.restaurant_table_id,
        table_sessions.status,
        table_sessions.opened_at;
END;
$function$;

REVOKE ALL ON FUNCTION public.open_waiter_table_session(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.open_waiter_table_session(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.open_waiter_table_session(uuid) TO authenticated;

COMMIT;
