-- Add permissions column to user_info table
ALTER TABLE user_info ADD COLUMN permissions TEXT DEFAULT NULL;
