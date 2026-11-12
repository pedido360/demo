BEGIN;

CREATE OR REPLACE FUNCTION public.acknowledge_print_job(
    p_job_id uuid,
    p_agent_id uuid,
    p_claim_token uuid,
    p_result text,
    p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    IF p_result NOT IN ('submitted', 'printed', 'failed') THEN
        RAISE EXCEPTION 'Resultado de impresion no valido.';
    END IF;

    UPDATE public.print_jobs pj
       SET status = p_result,
           last_error = CASE
               WHEN p_result IN ('failed', 'submitted') THEN p_error
               ELSE NULL
           END,
           submitted_at = CASE
               WHEN p_result IN ('submitted', 'printed') THEN now()
               ELSE pj.submitted_at
           END,
           printed_at = CASE
               WHEN p_result = 'printed' THEN now()
               ELSE pj.printed_at
           END,
           claim_token = NULL,
           claimed_at = NULL,
           lease_expires_at = NULL,
           updated_at = now()
     WHERE pj.id = p_job_id
       AND pj.print_agent_id = p_agent_id
       AND pj.claim_token = p_claim_token
       AND pj.status = 'processing'
       AND pj.lease_expires_at > now()
       AND EXISTS (
           SELECT 1
             FROM public.print_agents pa
            WHERE pa.id = p_agent_id
              AND pa.restaurant_id = pj.restaurant_id
              AND pa.is_active = true
       );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trabajo no reclamado por este agente, vencido o ya procesado.';
    END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.acknowledge_print_job(uuid, uuid, uuid, text, text)
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.acknowledge_print_job(uuid, uuid, uuid, text, text)
    TO service_role;

COMMIT;
