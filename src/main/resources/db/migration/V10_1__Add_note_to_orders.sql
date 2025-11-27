-- =============================================
-- V10_1__Add_note_to_orders.sql
-- Purpose: Add note column to orders table
-- This was moved from V6 to ensure table exists before modification
-- =============================================

-- Add note column to orders if not exists
SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'note'
);

SET @ddl := IF(@col_exists = 0,
               'ALTER TABLE orders ADD COLUMN note VARCHAR(1024) NULL',
               'SELECT 1');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;