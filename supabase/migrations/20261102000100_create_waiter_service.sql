-- Pedidos360: modulo independiente de servicio de mesas y pedidos para llevar.
-- Esta migracion NO modifica public.orders ni las tablas del catalogo.

-- 1. Se reutiliza profiles_role_check existente; no se modifica public.profiles.

-- 2. Cuentas de meseros.
-- Las credenciales viven exclusivamente en Supabase Auth.
CREATE TABLE public.waiter_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL UNIQUE
        REFERENCES public.profiles(id) ON DELETE RESTRICT,
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deactivated')),
    created_by_profile_id uuid
        REFERENCES public.profiles(id) ON DELETE SET NULL,
    deactivated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX waiter_accounts_restaurant_status_idx
    ON public.waiter_accounts (restaurant_id, status);

-- 3. Mesas fijas y mesas personalizadas.
CREATE TABLE public.restaurant_tables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    table_number integer,
    label text NOT NULL,
    is_custom boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT restaurant_tables_number_positive
        CHECK (table_number IS NULL OR table_number > 0),
    CONSTRAINT restaurant_tables_label_nonempty
        CHECK (length(btrim(label)) > 0),
    CONSTRAINT restaurant_tables_custom_consistency
        CHECK (
            (is_custom = true AND table_number IS NULL)
            OR (is_custom = false AND table_number IS NOT NULL)
        )
);

CREATE UNIQUE INDEX restaurant_tables_number_unique
    ON public.restaurant_tables (restaurant_id, table_number)
    WHERE table_number IS NOT NULL;

CREATE UNIQUE INDEX restaurant_tables_label_unique
    ON public.restaurant_tables (restaurant_id, lower(label));

CREATE INDEX restaurant_tables_active_order_idx
    ON public.restaurant_tables (restaurant_id, is_active, sort_order);

-- 4. Cuentas abiertas de mesas.
CREATE TABLE public.table_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    restaurant_table_id uuid NOT NULL
        REFERENCES public.restaurant_tables(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'paid', 'cancelled')),
    opened_by_waiter_id uuid NOT NULL
        REFERENCES public.waiter_accounts(id) ON DELETE RESTRICT,
    closed_by_waiter_id uuid
        REFERENCES public.waiter_accounts(id) ON DELETE RESTRICT,
    opened_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    close_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT table_sessions_close_consistency
        CHECK (
            (status = 'open' AND closed_at IS NULL AND closed_by_waiter_id IS NULL)
            OR (status IN ('paid', 'cancelled') AND closed_at IS NOT NULL AND closed_by_waiter_id IS NOT NULL)
        )
);

CREATE UNIQUE INDEX table_sessions_one_open_per_table
    ON public.table_sessions (restaurant_table_id)
    WHERE status = 'open';

CREATE INDEX table_sessions_restaurant_status_idx
    ON public.table_sessions (restaurant_id, status, opened_at DESC);

-- 5. Rondas de pedidos y pedidos para llevar.
-- items guarda una fotografia historica del producto, precio y opciones.
CREATE TABLE public.service_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    order_type text NOT NULL
        CHECK (order_type IN ('dine_in', 'takeaway')),
    table_session_id uuid
        REFERENCES public.table_sessions(id) ON DELETE RESTRICT,
    waiter_id uuid NOT NULL
        REFERENCES public.waiter_accounts(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'cancelled')),
    items jsonb NOT NULL
        CHECK (jsonb_typeof(items) = 'array'),
    subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0 AND subtotal = trunc(subtotal)),
    total numeric(12,2) NOT NULL CHECK (total >= 0 AND total = trunc(total)),
    notes text,
    idempotency_key uuid NOT NULL,
    cancellation_reason text,
    cancelled_by_profile_id uuid
        REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT service_orders_type_session_consistency
        CHECK (
            (order_type = 'dine_in' AND table_session_id IS NOT NULL)
            OR (order_type = 'takeaway' AND table_session_id IS NULL)
        ),
    CONSTRAINT service_orders_cancellation_consistency
        CHECK (
            (status = 'confirmed' AND cancellation_reason IS NULL)
            OR (status = 'cancelled' AND cancellation_reason IS NOT NULL)
        ),
    UNIQUE (restaurant_id, idempotency_key)
);

CREATE INDEX service_orders_session_history_idx
    ON public.service_orders (table_session_id, created_at);

CREATE INDEX service_orders_restaurant_history_idx
    ON public.service_orders (restaurant_id, created_at DESC);

-- 6. Agentes instalados en los computadores de caja.
-- Solo se almacena el hash del secreto, nunca el secreto original.
CREATE TABLE public.print_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    agent_name text NOT NULL,
    token_hash text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    last_seen_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (restaurant_id, agent_name)
);

-- 7. Trabajos de impresion independientes por destino.
-- Un pedido genera una tarea para caja y otra para cocina.
CREATE TABLE public.print_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id uuid NOT NULL
        REFERENCES public.service_orders(id) ON DELETE RESTRICT,
    destination text NOT NULL
        CHECK (destination IN ('cashier', 'kitchen')),
    status text NOT NULL DEFAULT 'queued'
        CHECK (
            status IN (
                'queued', 'processing', 'submitted',
                'printed', 'failed', 'cancelled'
            )
        ),
    payload jsonb NOT NULL
        CHECK (jsonb_typeof(payload) = 'object'),
    print_agent_id uuid
        REFERENCES public.print_agents(id) ON DELETE RESTRICT,
    claim_token uuid,
    claimed_at timestamptz,
    lease_expires_at timestamptz,
    attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    submitted_at timestamptz,
    printed_at timestamptz,
    UNIQUE (service_order_id, destination)
);

CREATE INDEX print_jobs_queue_idx
    ON public.print_jobs (status, created_at)
    WHERE status IN ('queued', 'failed');

CREATE INDEX print_jobs_processing_lease_idx
    ON public.print_jobs (lease_expires_at)
    WHERE status = 'processing';

-- 8. Auditoria de acciones del servicio de mesas.
CREATE TABLE public.service_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL
        REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    actor_profile_id uuid
        REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_waiter_id uuid
        REFERENCES public.waiter_accounts(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_audit_logs_restaurant_date_idx
    ON public.service_audit_logs (restaurant_id, created_at DESC);

-- 9. Seguridad: acceso directo bloqueado para clientes publicos.
-- El servidor usara exclusivamente la clave service_role.
ALTER TABLE public.waiter_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
    public.waiter_accounts,
    public.restaurant_tables,
    public.table_sessions,
    public.service_orders,
    public.print_agents,
    public.print_jobs,
    public.service_audit_logs
FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
    public.waiter_accounts,
    public.restaurant_tables,
    public.table_sessions,
    public.service_orders,
    public.print_agents,
    public.print_jobs,
    public.service_audit_logs
TO service_role;

GRANT USAGE ON SCHEMA public TO service_role;

-- INTEGRIDAD MULTITENANT
-- Impide asociar meseros, mesas, cuentas, pedidos y agentes
-- pertenecientes a restaurantes diferentes.

ALTER TABLE public.waiter_accounts
    ADD CONSTRAINT waiter_accounts_id_restaurant_unique
    UNIQUE (id, restaurant_id);

ALTER TABLE public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_id_restaurant_unique
    UNIQUE (id, restaurant_id);

ALTER TABLE public.table_sessions
    ADD CONSTRAINT table_sessions_id_restaurant_unique
    UNIQUE (id, restaurant_id);

ALTER TABLE public.service_orders
    ADD CONSTRAINT service_orders_id_restaurant_unique
    UNIQUE (id, restaurant_id);

ALTER TABLE public.print_agents
    ADD CONSTRAINT print_agents_id_restaurant_unique
    UNIQUE (id, restaurant_id);

ALTER TABLE public.table_sessions
    ADD CONSTRAINT table_sessions_table_restaurant_fk
    FOREIGN KEY (restaurant_table_id, restaurant_id)
    REFERENCES public.restaurant_tables (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.table_sessions
    ADD CONSTRAINT table_sessions_opened_waiter_restaurant_fk
    FOREIGN KEY (opened_by_waiter_id, restaurant_id)
    REFERENCES public.waiter_accounts (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.table_sessions
    ADD CONSTRAINT table_sessions_closed_waiter_restaurant_fk
    FOREIGN KEY (closed_by_waiter_id, restaurant_id)
    REFERENCES public.waiter_accounts (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.service_orders
    ADD CONSTRAINT service_orders_session_restaurant_fk
    FOREIGN KEY (table_session_id, restaurant_id)
    REFERENCES public.table_sessions (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.service_orders
    ADD CONSTRAINT service_orders_waiter_restaurant_fk
    FOREIGN KEY (waiter_id, restaurant_id)
    REFERENCES public.waiter_accounts (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.print_jobs
    ADD COLUMN restaurant_id uuid;

UPDATE public.print_jobs AS jobs
SET restaurant_id = orders.restaurant_id
FROM public.service_orders AS orders
WHERE orders.id = jobs.service_order_id;

ALTER TABLE public.print_jobs
    ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE public.print_jobs
    ADD CONSTRAINT print_jobs_order_restaurant_fk
    FOREIGN KEY (service_order_id, restaurant_id)
    REFERENCES public.service_orders (id, restaurant_id)
    ON DELETE RESTRICT;

ALTER TABLE public.print_jobs
    ADD CONSTRAINT print_jobs_agent_restaurant_fk
    FOREIGN KEY (print_agent_id, restaurant_id)
    REFERENCES public.print_agents (id, restaurant_id)
    ON DELETE RESTRICT;

-- La relacion con profiles se conserva mediante profiles.id.
-- La pertenencia al restaurante se valida en el servidor.
