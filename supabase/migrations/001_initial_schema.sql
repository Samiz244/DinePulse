-- ============================================================
-- DinePulse: Initial Schema
-- Migration: 001_initial_schema.sql
-- Rollback:  001_rollback.sql
-- ============================================================

-- pgcrypto required for bcrypt passcode hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- TABLE: profiles
-- One row per Supabase Auth user. Created automatically via
-- the handle_new_user trigger below.
-- ============================================================
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'manager')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users see only their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Trigger handles insert; this policy is a belt-and-suspenders guard
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users update only their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- TABLE: restaurants
-- Owned by a manager profile. Passcode stored as bcrypt hash.
-- ON DELETE RESTRICT prevents deleting a manager who owns a restaurant.
-- ============================================================
CREATE TABLE restaurants (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name                  TEXT        NOT NULL,
  cuisine_type          TEXT,
  manager_passcode_hash TEXT        NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Any visitor (authenticated or not) can browse restaurants
CREATE POLICY "restaurants_select_public"
  ON restaurants FOR SELECT
  USING (TRUE);

-- Owners can only insert a restaurant linked to themselves
CREATE POLICY "restaurants_insert_owner"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can only update their own restaurant
CREATE POLICY "restaurants_update_owner"
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id);

-- Owners can only delete their own restaurant
CREATE POLICY "restaurants_delete_owner"
  ON restaurants FOR DELETE
  USING (auth.uid() = owner_id);


-- ============================================================
-- TABLE: menu_items
-- Belongs to a restaurant. ON DELETE CASCADE ensures no orphaned
-- items if a restaurant is deleted.
-- ============================================================
CREATE TABLE menu_items (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT          NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category      TEXT,
  is_available  BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Any visitor can view menu items
CREATE POLICY "menu_items_select_public"
  ON menu_items FOR SELECT
  USING (TRUE);

-- Insert allowed only if the caller owns the referenced restaurant
CREATE POLICY "menu_items_insert_owner"
  ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- Update allowed only if the caller owns the referenced restaurant
CREATE POLICY "menu_items_update_owner"
  ON menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- Delete allowed only if the caller owns the referenced restaurant
CREATE POLICY "menu_items_delete_owner"
  ON menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );


-- ============================================================
-- TRIGGER: handle_new_user
-- Auto-creates a profiles row for every new Supabase Auth user.
-- SECURITY DEFINER allows writing to profiles before the user
-- has an active session.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- RPC: verify_manager_passcode
-- Verifies a manager's passcode against the stored bcrypt hash.
-- Returns FALSE if the caller does not own the restaurant or the
-- passcode is wrong. Plaintext is never stored or returned.
--
-- Client usage:
--   const { data: ok } = await supabase.rpc('verify_manager_passcode', {
--     p_restaurant_id: id,
--     p_passcode: userInput,
--   })
--   if (!ok) throw new Error('Invalid manager passcode')
-- ============================================================
CREATE OR REPLACE FUNCTION verify_manager_passcode(
  p_restaurant_id UUID,
  p_passcode      TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT manager_passcode_hash INTO v_hash
  FROM restaurants
  WHERE id = p_restaurant_id
    AND owner_id = auth.uid();

  IF v_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN crypt(p_passcode, v_hash) = v_hash;
END;
$$;
