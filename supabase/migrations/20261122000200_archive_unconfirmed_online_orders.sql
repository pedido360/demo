ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_orders_pending_unarchived
ON public.orders (restaurant_id, created_at DESC)
WHERE status = 'pending'
  AND source = 'whatsapp'
  AND archived_at IS NULL;
