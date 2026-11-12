-- Pedidos360: proteger la información histórica del módulo de meseros.
-- No permite DELETE ni TRUNCATE sobre las tablas operativas.
-- Las cuentas se cierran mediante cambios de estado, nunca eliminándolas.

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_waiter_service_history_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
    RAISE EXCEPTION
        'Operacion % bloqueada sobre %.%. Los registros del servicio de meseros se conservan.',
        TG_OP,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME
        USING ERRCODE = '55000',
              HINT = 'Use cambios de estado y procedimientos de cierre; no elimine registros historicos.';
END;
$function$;

-- Protección contra eliminación individual.
CREATE TRIGGER waiter_accounts_no_delete
BEFORE DELETE ON public.waiter_accounts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER restaurant_tables_no_delete
BEFORE DELETE ON public.restaurant_tables
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER table_sessions_no_delete
BEFORE DELETE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER service_orders_no_delete
BEFORE DELETE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER print_agents_no_delete
BEFORE DELETE ON public.print_agents
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER print_jobs_no_delete
BEFORE DELETE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER service_audit_logs_no_delete
BEFORE DELETE ON public.service_audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

-- Protección adicional contra vaciado completo de tablas.
CREATE TRIGGER waiter_accounts_no_truncate
BEFORE TRUNCATE ON public.waiter_accounts
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER restaurant_tables_no_truncate
BEFORE TRUNCATE ON public.restaurant_tables
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER table_sessions_no_truncate
BEFORE TRUNCATE ON public.table_sessions
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER service_orders_no_truncate
BEFORE TRUNCATE ON public.service_orders
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER print_agents_no_truncate
BEFORE TRUNCATE ON public.print_agents
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER print_jobs_no_truncate
BEFORE TRUNCATE ON public.print_jobs
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();

CREATE TRIGGER service_audit_logs_no_truncate
BEFORE TRUNCATE ON public.service_audit_logs
FOR EACH STATEMENT
EXECUTE FUNCTION public.prevent_waiter_service_history_delete();


-- Proteger los datos originales frente a modificaciones accidentales.
-- Solo se permiten cambios en las columnas operativas expresamente autorizadas.

CREATE OR REPLACE FUNCTION public.prevent_waiter_service_identity_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
    IF (to_jsonb(NEW) - TG_ARGV)
       IS DISTINCT FROM
       (to_jsonb(OLD) - TG_ARGV) THEN
        RAISE EXCEPTION
            'Actualizacion bloqueada: no se pueden modificar datos historicos de %.%.',
            TG_TABLE_SCHEMA,
            TG_TABLE_NAME
            USING ERRCODE = '55000',
                  HINT = 'Solo se permiten cambios en los campos operativos autorizados.';
    END IF;

    RETURN NEW;
END;
$function$;

-- Cuentas de meseros: identidad y restaurante protegidos.
-- Se permiten cambios de usuario y estado.
CREATE TRIGGER waiter_accounts_identity_guard
BEFORE UPDATE ON public.waiter_accounts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'username', 'status', 'deactivated_at', 'updated_at'
);

-- Mesas: se conserva su identidad y restaurante.
-- Se permiten cambios de etiqueta, numeracion, orden y activacion.
CREATE TRIGGER restaurant_tables_identity_guard
BEFORE UPDATE ON public.restaurant_tables
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'label', 'table_number', 'is_active', 'sort_order'
);

-- Sesiones: no se permite cambiar quien abrio la cuenta,
-- su mesa ni su restaurante. Solo se permiten datos de cierre.
CREATE TRIGGER table_sessions_identity_guard
BEFORE UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'status', 'closed_by_waiter_id', 'closed_at', 'close_reason'
);

-- Pedidos: sus productos, importes, restaurante, mesa y responsable
-- quedan protegidos. Solo se permiten cancelaciones y su estado.
CREATE TRIGGER service_orders_identity_guard
BEFORE UPDATE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'status', 'cancellation_reason', 'cancelled_by_profile_id', 'updated_at'
);

-- Agentes: se permite administrar nombre, token, activacion y actividad.
CREATE TRIGGER print_agents_identity_guard
BEFORE UPDATE ON public.print_agents
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'agent_name', 'token_hash', 'is_active', 'last_seen_at'
);

-- Impresiones: se permite actualizar el procesamiento,
-- reintentos y resultado; no cambiar pedido, destino ni contenido.
CREATE TRIGGER print_jobs_identity_guard
BEFORE UPDATE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'status', 'print_agent_id', 'claim_token', 'claimed_at',
    'lease_expires_at', 'attempt_count', 'last_error',
    'updated_at', 'submitted_at', 'printed_at'
);

-- Auditoria: los registros no se pueden modificar.
CREATE TRIGGER service_audit_logs_immutable
BEFORE UPDATE ON public.service_audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update();


-- Impedir la reversión accidental de estados y proteger estados terminales.
CREATE OR REPLACE FUNCTION public.enforce_waiter_service_state_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
DECLARE
    transition_allowed boolean := false;
BEGIN
    IF TG_TABLE_NAME = 'table_sessions' THEN
        IF OLD.status IN ('paid', 'cancelled') THEN
            IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
                RAISE EXCEPTION 'La cuenta cerrada no puede modificarse ni reabrirse.'
                    USING ERRCODE = '55000';
            END IF;
            RETURN NEW;
        END IF;

        transition_allowed :=
            OLD.status = 'open'
            AND NEW.status IN ('paid', 'cancelled');

    ELSIF TG_TABLE_NAME = 'service_orders' THEN
        IF OLD.status = 'cancelled' THEN
            IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
                RAISE EXCEPTION 'El pedido cancelado es un registro histórico inmutable.'
                    USING ERRCODE = '55000';
            END IF;
            RETURN NEW;
        END IF;

        transition_allowed :=
            OLD.status = 'confirmed'
            AND NEW.status = 'cancelled';

    ELSIF TG_TABLE_NAME = 'print_jobs' THEN
        IF OLD.status IN ('printed', 'cancelled') THEN
            IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
                RAISE EXCEPTION 'El trabajo de impresión terminado no puede modificarse.'
                    USING ERRCODE = '55000';
            END IF;
            RETURN NEW;
        END IF;

        transition_allowed :=
            (OLD.status = 'queued' AND NEW.status IN ('processing', 'cancelled'))
            OR (OLD.status = 'processing' AND NEW.status IN ('submitted', 'printed', 'failed'))
            OR (OLD.status = 'submitted' AND NEW.status IN ('printed', 'failed'))
            OR (OLD.status = 'failed' AND NEW.status = 'queued');
    END IF;

    -- Solo el mesero responsable de abrir la cuenta puede cerrarla.
    IF TG_TABLE_NAME = 'table_sessions' AND transition_allowed THEN
        IF NEW.closed_by_waiter_id IS DISTINCT FROM OLD.opened_by_waiter_id THEN
            RAISE EXCEPTION
                'Solo el mesero responsable puede cerrar esta cuenta.'
                USING ERRCODE = '55000';
        END IF;
    END IF;

    IF NOT transition_allowed THEN
        RAISE EXCEPTION
            'Transicion de estado no permitida en %.%: % -> %.',
            TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.status, NEW.status
            USING ERRCODE = '55000';
    END IF;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER table_sessions_state_guard
BEFORE UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_waiter_service_state_transition();

CREATE TRIGGER service_orders_state_guard
BEFORE UPDATE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_waiter_service_state_transition();

CREATE TRIGGER print_jobs_state_guard
BEFORE UPDATE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.enforce_waiter_service_state_transition();

COMMIT;
