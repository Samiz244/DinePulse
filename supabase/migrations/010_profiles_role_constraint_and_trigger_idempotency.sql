-- ============================================================
-- 010_profiles_role_constraint_and_trigger_idempotency.sql
-- 1. Widens the profiles.role CHECK constraint to include 'staff'
-- 2. Repairs handle_new_user with SET search_path and ON CONFLICT
--    so retried auth inserts never leave a partial profile row.
-- Rollback: 010_rollback.sql
-- ============================================================

-- ── 1. Role constraint ────────────────────────────────────────

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'manager', 'staff'));

-- ── 2. Trigger function — idempotent with explicit search_path ─

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role      = EXCLUDED.role;

  RETURN NEW;
END;
$$;

-- ── 3. Re-bind trigger ────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
