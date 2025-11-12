-- Fix Product Status ENUM case sensitivity issue
-- Convert existing lowercase enum values to uppercase to match Java enum

-- First, alter the column to use uppercase enum values
ALTER TABLE products MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE';

-- Update existing records from lowercase to uppercase
UPDATE products SET status = 'ACTIVE' WHERE status = 'active';
UPDATE products SET status = 'INACTIVE' WHERE status = 'inactive';
UPDATE products SET status = 'DISCONTINUED' WHERE status = 'discontinued';