-- Add optional profile fields for user management module
ALTER TABLE user_info
    ADD COLUMN birthday DATE NULL AFTER phone,
    ADD COLUMN address TEXT NULL AFTER birthday,
    ADD COLUMN note TEXT NULL AFTER address;
