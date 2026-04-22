-- ============================================================
-- DinePulse: Rollback Migration 001
-- Teardown order respects FK constraints.
-- Run this if 001_initial_schema.sql must be reverted.
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS verify_manager_passcode(UUID, TEXT);

-- CASCADE handles FK children, but explicit order is safer
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
