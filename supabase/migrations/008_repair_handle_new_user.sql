-- ============================================================
-- 008_repair_handle_new_user.sql
-- Drops and recreates the auth→profiles trigger function with
-- an explicit public. schema prefix and an empty-string fallback
-- for full_name (avoids phantom "Anonymous" profiles).
-- Resolves 500 signup errors caused by function resolution issues.
-- Rollback: 008_rollback.sql
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
