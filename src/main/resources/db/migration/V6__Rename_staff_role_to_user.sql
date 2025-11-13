-- Update existing records that still use the legacy STAFF enum value
UPDATE user_info
SET role = 'user'
WHERE role = 'staff';

-- Align ENUM definition with the new role set
ALTER TABLE user_info
    MODIFY role ENUM('admin', 'manager', 'user') DEFAULT 'user' NOT NULL;
