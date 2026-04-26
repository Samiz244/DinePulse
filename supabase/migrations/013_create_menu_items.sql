-- 1. Create the Menu Items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Category Constraint (Matches your DinePulse TypeScript types)
-- This ensures data integrity even outside the React UI
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_category_check') THEN
        ALTER TABLE public.menu_items 
        ADD CONSTRAINT menu_items_category_check 
        CHECK (category IN ('Pizzas', 'Sides', 'Drinks', 'Desserts'));
    END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Public can view menu items (for the Shopping Cart/Public Menu)
CREATE POLICY "Allow public select access to menu items"
ON public.menu_items FOR SELECT
USING (true);

-- 5. RLS Policy: Only the restaurant owner can manage their items
CREATE POLICY "Managers can manage their own menu items"
ON public.menu_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = menu_items.restaurant_id
        AND owner_id = auth.uid()
    )
);

-- 6. Trigger for 'updated_at' column
CREATE OR REPLACE TRIGGER set_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();