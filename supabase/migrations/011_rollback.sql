REVOKE SELECT ON public.profiles FROM authenticated;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Restore original policy from 001 (no TO clause, no explicit GRANT)
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
