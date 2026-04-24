-- ============================================================
-- 009_repair_leads_and_rpc.sql
-- Idempotently creates the leads table that was missing from the
-- live Supabase project (004 was never applied), re-creates the
-- check_manager_lead RPC with an explicit public. schema prefix,
-- and seeds the onboarding test lead.
-- Rollback: 009_rollback.sql
-- ============================================================

-- ── leads table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        UNIQUE NOT NULL,
  restaurant_name TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone may submit a lead (unauthenticated interest form)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'leads_insert_anon'
  ) THEN
    CREATE POLICY "leads_insert_anon"
      ON public.leads FOR INSERT WITH CHECK (TRUE);
  END IF;
END $$;

-- A user may only read a lead that matches their own auth email
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'leads_select_own'
  ) THEN
    CREATE POLICY "leads_select_own"
      ON public.leads FOR SELECT
      USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

-- ── check_manager_lead RPC ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_manager_lead(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leads
    WHERE lower(email) = lower(p_email)
      AND status = 'approved'
  );
END;
$$;

-- ── Seed test lead ────────────────────────────────────────────

INSERT INTO public.leads (email, status, restaurant_name)
VALUES ('szalemu3@gmail.com', 'approved', 'Onboarding Test')
ON CONFLICT (email) DO UPDATE SET status = 'approved';
