-- Agrega un identificador operativo unico por restaurante.
-- El inicio de sesion utiliza correo y contrasena de Supabase Auth.

ALTER TABLE public.waiter_accounts
ADD COLUMN username text;

-- Completar registros anteriores sin identificador.
UPDATE public.waiter_accounts
SET username = 'mesero-' || substr(replace(id::text, '-', ''), 1, 12)
WHERE username IS NULL;

ALTER TABLE public.waiter_accounts
ALTER COLUMN username SET NOT NULL;

ALTER TABLE public.waiter_accounts
ADD CONSTRAINT waiter_accounts_username_format_check
CHECK (
    username = lower(btrim(username))
    AND username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'
);

CREATE UNIQUE INDEX waiter_accounts_username_unique_idx
ON public.waiter_accounts (restaurant_id, username);
