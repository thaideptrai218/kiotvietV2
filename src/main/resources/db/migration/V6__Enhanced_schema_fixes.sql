-- =============================================
-- V6__Enhanced_schema_fixes.sql
-- Purpose: Consolidate all small schema fixes and enhancements
-- Consolidates: V5_1, V6, V7, V10, V14_1, V15, V16
-- =============================================

-- Fix Product Status ENUM case sensitivity issue (from V5_1)
-- Convert existing lowercase enum values to uppercase to match Java enum
ALTER TABLE products MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE';

-- Add optional profile fields for user management (from V6)
ALTER TABLE user_info
    ADD COLUMN birthday DATE NULL AFTER phone,
    ADD COLUMN address TEXT NULL AFTER birthday,
    ADD COLUMN note TEXT NULL AFTER address;

-- Update existing records that still use the legacy STAFF enum value (from V7)
UPDATE user_info
SET role = 'user'
WHERE role = 'staff';

-- Align ENUM definition with the new role set (from V7)
ALTER TABLE user_info
    MODIFY role ENUM('admin', 'manager', 'user') DEFAULT 'user' NOT NULL;

-- Ensure legacy data uses the new 'user' role value instead of 'staff' (from V10)
UPDATE user_info
SET role = 'user'
WHERE role IN ('staff', 'Staff', 'STAFF');

-- Align enum definition with the supported roles (from V10)
ALTER TABLE user_info
    MODIFY role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user';

-- Extend companies table with store info fields (from V11)
ALTER TABLE companies
    ADD COLUMN country VARCHAR(100) AFTER address,
    ADD COLUMN country_flag VARCHAR(10) AFTER country,
    ADD COLUMN province VARCHAR(255) AFTER country_flag,
    ADD COLUMN ward VARCHAR(255) AFTER province,
    ADD COLUMN logo_url TEXT AFTER ward;

-- Note: inventory_counts table modifications moved to V11_1 (after table creation)

-- Add image column to products (from V15)
ALTER TABLE products ADD COLUMN image VARCHAR(255);

-- Note: orders table modification moved to V10_1 (after table creation)

-- Ensure all users have proper enum values
UPDATE user_info SET role = 'user' WHERE role IS NULL OR role NOT IN ('admin', 'manager', 'user');

-- Ensure all products have proper status values
UPDATE products SET status = 'ACTIVE' WHERE status IS NULL OR status NOT IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED');