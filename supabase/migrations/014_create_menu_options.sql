-- 1. Create Options Table (for Sizes/Add-ons)
CREATE TABLE IF NOT EXISTS public.menu_item_options (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id  UUID          NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name          TEXT          NOT NULL, -- e.g., 'Large', 'Small', 'Extra Spicy'
  price_premium NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Access via the parent restaurant
CREATE POLICY "Managers can manage item options"
  ON public.menu_item_options
  FOR ALL
  TO authenticated
  USING (
    menu_item_id IN (
      SELECT id FROM public.menu_items WHERE restaurant_id IN (
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
      )
    )
  );

-- 4. Public Access
CREATE POLICY "Public can view options"
  ON public.menu_item_options FOR SELECT TO anon, authenticated USING (true);

GRANT ALL ON public.menu_item_options TO authenticated;
GRANT SELECT ON public.menu_item_options TO anon;