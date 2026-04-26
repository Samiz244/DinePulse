-- ============================================================
-- 015_restaurant_tables.sql
-- Stores named table stations per restaurant. Each row maps to a
-- QR code that deep-links to the menu with the table pre-selected.
-- ON DELETE CASCADE ensures tables are cleaned up with the restaurant.
-- Rollback: 015_rollback.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id
  ON public.restaurant_tables (restaurant_id, sort_order);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Owners manage their own tables
CREATE POLICY "tables_owner_all"
  ON public.restaurant_tables
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Public can read tables (needed for the customer menu page to resolve table name)
CREATE POLICY "tables_public_select"
  ON public.restaurant_tables
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT ALL    ON public.restaurant_tables TO authenticated;
GRANT SELECT ON public.restaurant_tables TO anon;
