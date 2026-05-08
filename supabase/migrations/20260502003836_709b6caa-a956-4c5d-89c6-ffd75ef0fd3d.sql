-- Function for guests to look up a single order by short reference + email.
-- Returns the order plus its items as JSON. Bypasses RLS via SECURITY DEFINER
-- but only matches when the caller knows BOTH the 8-char ref prefix AND the
-- exact email used at checkout.
CREATE OR REPLACE FUNCTION public.lookup_order_by_ref(
  p_ref text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_items jsonb;
BEGIN
  IF p_ref IS NULL OR length(trim(p_ref)) < 6 THEN
    RETURN NULL;
  END IF;
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_order
  FROM orders
  WHERE id::text LIKE lower(trim(p_ref)) || '%'
    AND lower(customer_email) = lower(trim(p_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', oi.id,
    'quantity', oi.quantity,
    'price', oi.price,
    'product_id', oi.product_id,
    'product_name', p.name
  )), '[]'::jsonb)
  INTO v_items
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'customer_name', v_order.customer_name,
    'customer_email', v_order.customer_email,
    'customer_phone', v_order.customer_phone,
    'notes', v_order.notes,
    'status', v_order.status,
    'total', v_order.total,
    'created_at', v_order.created_at,
    'items', v_items
  );
END;
$$;

-- Allow anyone (including anonymous visitors) to call this function.
GRANT EXECUTE ON FUNCTION public.lookup_order_by_ref(text, text) TO anon, authenticated;