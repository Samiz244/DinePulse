-- ============================================================
-- DinePulse: Menu Items Category CHECK Constraint
-- Migration: 003_menu_items_category_constraint.sql
-- Rollback:  003_rollback.sql
-- ============================================================
-- Adds a CHECK constraint to menu_items.category to enforce
-- that only known category values reach the database.
-- NULL is permitted — the column is nullable in the original schema.
--
-- ⚠️  CATEGORY LIST NOTE:
-- The allowed values below ('Pizzas', 'Sides', 'Drinks', 'Desserts')
-- were specified in the engineering task brief and OVERRIDE the
-- Architect design draft ('Starters', 'Mains', etc.).
-- The MENU_CATEGORIES constant in src/constants/menuCategories.js
-- MUST match this list exactly to avoid RLS insert rejections.
--
-- Rollback: ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
-- ============================================================

-- Idempotent: skips if the constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'menu_items_category_check'
      AND  conrelid = 'menu_items'::regclass
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_category_check
      CHECK (
        category IS NULL
        OR category IN ('Pizzas', 'Sides', 'Drinks', 'Desserts')
      );
  END IF;
END $$;
