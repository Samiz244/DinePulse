-- ============================================================
-- DinePulse: create_restaurant RPC
-- Migration: 002_create_restaurant_rpc.sql
-- Rollback:  002_rollback.sql
-- ============================================================
-- Atomically hashes the passcode and inserts a new restaurant
-- row owned by the calling authenticated user.
--
-- SECURITY DEFINER: bypasses RLS for the insert; ownership is
-- enforced by hardcoding owner_id = auth.uid() in the function
-- body — the client never supplies owner_id.
--
-- manager_passcode_hash is intentionally excluded from the
-- RETURNS TABLE definition so the hash never reaches the client.
--
-- Client usage:
--   const { data, error } = await supabase.rpc('create_restaurant', {
--     p_name:     'The Burger Joint',
--     p_cuisine:  'Burgers',
--     p_passcode: 'secret123',
--   })
--   if (error) // surface error to user
--   // data: { id, owner_id, name, cuisine_type, created_at }
-- ============================================================

CREATE OR REPLACE FUNCTION create_restaurant(
  p_name     TEXT,
  p_cuisine  TEXT,
  p_passcode TEXT
)
RETURNS TABLE (
  id           UUID,
  owner_id     UUID,
  name         TEXT,
  cuisine_type TEXT,
  created_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Explicit auth guard: raises a clear error rather than letting
  -- a NULL owner_id silently hit the NOT NULL constraint.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  INSERT INTO restaurants (owner_id, name, cuisine_type, manager_passcode_hash)
  VALUES (
    auth.uid(),
    p_name,
    p_cuisine,
    crypt(p_passcode, gen_salt('bf'))   -- plaintext never stored
  )
  RETURNING
    restaurants.id,
    restaurants.owner_id,
    restaurants.name,
    restaurants.cuisine_type,
    restaurants.created_at;
END;
$$;
