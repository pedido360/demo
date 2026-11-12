BEGIN;

-- NULL identifica las mesas permanentes.
-- Las mesas temporales guardan su fecha de vigencia en hora local de Colombia.
ALTER TABLE public.restaurant_tables
ADD COLUMN IF NOT EXISTS temporary_until date;

-- Autoriza actualizar la vigencia sin debilitar la protección histórica.
DROP TRIGGER IF EXISTS restaurant_tables_identity_guard
ON public.restaurant_tables;

CREATE TRIGGER restaurant_tables_identity_guard
BEFORE UPDATE ON public.restaurant_tables
FOR EACH ROW
EXECUTE FUNCTION public.prevent_waiter_service_identity_update(
    'label',
    'table_number',
    'is_active',
    'sort_order',
    'temporary_until'
);

-- La mesa extra creada durante la prueba vence el día de su creación.
UPDATE public.restaurant_tables
SET temporary_until = (created_at AT TIME ZONE 'America/Bogota')::date
WHERE restaurant_id = '512f6a5b-e169-4e7a-b3a2-30f0b9b5a0cd'
  AND table_number = 7
  AND temporary_until IS NULL;

COMMIT;
