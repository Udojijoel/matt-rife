
-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_name_time ON public.analytics_events (event_name, created_at DESC);
CREATE INDEX idx_analytics_events_time ON public.analytics_events (created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view analytics events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public receipt lookup (sanitized — no email/phone)
CREATE OR REPLACE FUNCTION public.get_public_receipt(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_items jsonb;
BEGIN
  IF p_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'quantity', oi.quantity,
    'price', oi.price,
    'product_name', p.name
  )), '[]'::jsonb)
  INTO v_items
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'customer_name', v_order.customer_name,
    'status', v_order.status,
    'total', v_order.total,
    'created_at', v_order.created_at,
    'notes', v_order.notes,
    'items', v_items
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_receipt(uuid) TO anon, authenticated;
