-- ============================================================
-- DinePulse: Rollback Migration 003
-- Run this if 003_menu_items_category_constraint.sql must be reverted.
-- ============================================================

ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
