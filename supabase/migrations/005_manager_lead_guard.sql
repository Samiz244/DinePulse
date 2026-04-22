-- ============================================================
-- DinePulse: Manager Lead Guard & Staff Code RPC
-- Migration: 005_manager_lead_guard.sql
-- Rollback:  005_rollback.sql
-- ============================================================

-- RPC: client calls this before signUp to check lead approval.
-- lower() normalises case so Sam@example.com matches sam@example.com.
CREATE OR REPLACE FUNCTION check_manager_lead(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM leads
    WHERE lower(email) = lower(p_email)
      AND status = 'approved'
  );
END;
$$;

-- Trigger function: server-side belt-and-suspenders guard.
-- Fires BEFORE INSERT on profiles. If a manager's email is not in leads
-- with status='approved', the profile insert is rejected and the exception
-- message surfaces through mapAuthError on the client.
CREATE OR REPLACE FUNCTION enforce_manager_lead()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'manager' THEN
    IF NOT EXISTS (
      SELECT 1 FROM leads
      WHERE lower(email) = lower(
        (SELECT email FROM auth.users WHERE id = NEW.id)
      )
      AND status = 'approved'
    ) THEN
      RAISE EXCEPTION 'manager_signup_not_approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_manager_lead_before_profile
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_manager_lead();

-- RPC: verifies a staff_code for a given restaurant.
-- Returns FALSE if restaurant has no staff_code set.
-- staff_code is a low-value operational credential — not bcrypt hashed.
CREATE OR REPLACE FUNCTION verify_staff_code(
  p_restaurant_id UUID,
  p_staff_code    TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_code TEXT;
BEGIN
  SELECT staff_code INTO v_code FROM restaurants WHERE id = p_restaurant_id;
  IF v_code IS NULL THEN RETURN FALSE; END IF;
  RETURN v_code = p_staff_code;
END;
$$;
