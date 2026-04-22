DROP TRIGGER IF EXISTS check_manager_lead_before_profile ON profiles;
DROP FUNCTION IF EXISTS enforce_manager_lead();
DROP FUNCTION IF EXISTS check_manager_lead(TEXT);
DROP FUNCTION IF EXISTS verify_staff_code(UUID, TEXT);
