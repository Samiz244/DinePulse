-- ============================================================
-- DinePulse: Leads Table & Restaurant Column Additions
-- Migration: 004_leads_and_restaurant_columns.sql
-- Rollback:  004_rollback.sql
-- ============================================================

-- Leads: pre-approved manager applicants
CREATE TABLE leads (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL UNIQUE,
  restaurant_name TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone may submit a lead (interest form, no auth required)
CREATE POLICY "leads_insert_anon"
  ON leads FOR INSERT WITH CHECK (TRUE);

-- A user may only read a lead matching their own email
CREATE POLICY "leads_select_own"
  ON leads FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- slug: human-readable public URL segment, must be unique
-- staff_code: short plaintext code shared with floor staff
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS slug       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS staff_code TEXT;
