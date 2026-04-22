-- ============================================================
-- DinePulse: Rollback Migration 002
-- Run this if 002_create_restaurant_rpc.sql must be reverted.
-- ============================================================

DROP FUNCTION IF EXISTS create_restaurant(TEXT, TEXT, TEXT);
