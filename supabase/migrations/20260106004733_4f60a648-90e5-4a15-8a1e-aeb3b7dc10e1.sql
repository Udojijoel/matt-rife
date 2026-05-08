-- Create a secure function to create orders with server-side price validation
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_notes TEXT,
  p_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_calculated_total DECIMAL := 0;
  v_item RECORD;
BEGIN
  -- Validate required fields
  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  
  IF p_customer_email IS NULL OR trim(p_customer_email) = '' THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;
  
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Calculate total from actual product prices in database
  SELECT COALESCE(SUM(p.price * (item->>'quantity')::INTEGER), 0)
  INTO v_calculated_total
  FROM jsonb_array_elements(p_items) AS item
  JOIN products p ON p.id = (item->>'product_id')::UUID
  WHERE p.is_active = true;
  
  IF v_calculated_total <= 0 THEN
    RAISE EXCEPTION 'Invalid order total or products not found';
  END IF;

  -- Create order with server-validated total
  INSERT INTO orders (customer_name, customer_email, customer_phone, notes, total, user_id)
  VALUES (
    trim(p_customer_name), 
    trim(p_customer_email), 
    NULLIF(trim(COALESCE(p_customer_phone, '')), ''), 
    NULLIF(trim(COALESCE(p_notes, '')), ''),
    v_calculated_total,
    auth.uid()
  )
  RETURNING id INTO v_order_id;

  -- Insert items with validated prices from products table
  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 
    v_order_id, 
    (item->>'product_id')::UUID,
    (item->>'quantity')::INTEGER, 
    p.price
  FROM jsonb_array_elements(p_items) AS item
  JOIN products p ON p.id = (item->>'product_id')::UUID
  WHERE p.is_active = true;

  RETURN v_order_id;
END;
$$;

-- Drop the overly permissive INSERT policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Orders are now created only through the secure function
-- The function runs as SECURITY DEFINER so it bypasses RLS for inserts