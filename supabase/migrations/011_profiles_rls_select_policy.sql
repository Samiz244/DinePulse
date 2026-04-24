-- ============================================================
-- 011_profiles_rls_select_policy.sql
-- Fixes the profile SELECT timeout by ensuring authenticated
-- users have an explicit policy and GRANT to read their own row.
-- The original 001 policy used auth.uid() = id with no TO clause,
-- which defaults to PUBLIC — this replaces it with TO authenticated
-- and adds an explicit GRANT for belt-and-suspenders clarity.
-- Rollback: 011_rollback.sql
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove any stale or conflicting SELECT policies
DROP POLICY IF EXISTS "profiles_select_own"                    ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"             ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Authenticated users may read only their own row
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Explicit GRANT so the authenticated role can execute the SELECT
GRANT SELECT ON public.profiles TO authenticated;
