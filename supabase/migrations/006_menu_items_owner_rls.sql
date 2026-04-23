-- ============================================================
-- 006_menu_items_owner_rls.sql
-- Adds UPDATE and DELETE owner policies to menu_items.
-- INSERT policy was created in the initial schema (001).
-- ============================================================

-- UPDATE: only the restaurant owner may change their own items
DROP POLICY IF EXISTS "owner_update_menu_items" ON menu_items;
CREATE POLICY "owner_update_menu_items" ON menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id   = menu_items.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- DELETE: same ownership check
DROP POLICY IF EXISTS "owner_delete_menu_items" ON menu_items;
CREATE POLICY "owner_delete_menu_items" ON menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id   = menu_items.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );
