-- =============================================
-- V11_1__Add_merged_to_inventory_counts.sql
-- Purpose: Add merged_into column to inventory_counts table
-- This was moved from V6 to ensure table exists before modification
-- =============================================

-- Add merged_into column to inventory_counts if not exists
SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'inventory_counts'
      AND COLUMN_NAME = 'merged_into'
);

SET @ddl := IF(@col_exists = 0,
               'ALTER TABLE inventory_counts ADD COLUMN merged_into BIGINT NULL',
               'SELECT 1');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;