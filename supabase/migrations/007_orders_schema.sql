-- ============================================================
-- 007_orders_schema.sql
-- Creates orders + order_items tables, RLS policies, indexes,
-- and two SECURITY DEFINER RPCs:
--   insert_order        — atomic order creation (customer)
--   update_order_status — staff status progression (staff_code gated)
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────────

CREATE TABLE orders (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID          NOT NULL REFERENCES restaurants(id),
  table_number  INTEGER,
  status        TEXT          NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','preparing','ready','completed')),
  total_price   NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID          REFERENCES menu_items(id) ON DELETE SET NULL,
  name          TEXT          NOT NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  price_at_time NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX orders_restaurant_status_idx ON orders (restaurant_id, status);
CREATE INDEX order_items_order_idx        ON order_items (order_id);

-- ── RLS ──────────────────────────────────────────────────────────

ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Phase 1: permissive SELECT (operational data, not PII)
CREATE POLICY "anon_read_orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "anon_read_order_items"
  ON order_items FOR SELECT USING (true);

-- Manager UPDATE (status from dashboard — Phase 2)
CREATE POLICY "owner_update_orders"
  ON orders FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id          = orders.restaurant_id
        AND restaurants.owner_id   = auth.uid()
    )
  );

-- ── insert_order RPC ──────────────────────────────────────────────
-- Atomically inserts an order + all order_items in one transaction.
-- SECURITY DEFINER bypasses RLS so unauthenticated customers can write.

CREATE OR REPLACE FUNCTION insert_order(
  p_restaurant_id UUID,
  p_table_number  INTEGER,
  p_items         JSONB
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id UUID;
  v_total    NUMERIC;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM restaurants WHERE id = p_restaurant_id) THEN
    RAISE EXCEPTION 'restaurant_not_found';
  END IF;

  SELECT COALESCE(
    SUM((i->>'quantity')::int * (i->>'price_at_time')::numeric),
    0
  )
  INTO v_total
  FROM jsonb_array_elements(p_items) i;

  INSERT INTO orders (restaurant_id, table_number, status, total_price)
  VALUES (p_restaurant_id, p_table_number, 'pending', v_total)
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, menu_item_id, name, quantity, price_at_time)
  SELECT
    v_order_id,
    NULLIF(i->>'menu_item_id', '')::UUID,
    i->>'name',
    (i->>'quantity')::int,
    (i->>'price_at_time')::numeric
  FROM jsonb_array_elements(p_items) i;

  RETURN v_order_id;
END;
$$;

-- ── update_order_status RPC ───────────────────────────────────────
-- Validates the staff_code before allowing a status transition.
-- Staff are unauthenticated, so auth.uid() cannot be used here.

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id      UUID,
  p_restaurant_id UUID,
  p_code          TEXT,
  p_status        TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_status NOT IN ('pending','preparing','ready','completed') THEN
    RETURN FALSE;
  END IF;

  IF NOT (SELECT verify_staff_code(p_restaurant_id, p_code)) THEN
    RETURN FALSE;
  END IF;

  UPDATE orders
  SET    status = p_status
  WHERE  id            = p_order_id
    AND  restaurant_id = p_restaurant_id;

  RETURN FOUND;
END;
$$;
