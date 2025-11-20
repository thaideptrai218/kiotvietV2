-- Ensure legacy data uses the new 'user' role value instead of 'staff'
UPDATE user_info
SET role = 'user'
WHERE role IN ('staff', 'Staff', 'STAFF');

-- Align enum definition with the supported roles
ALTER TABLE user_info
    MODIFY role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user';
