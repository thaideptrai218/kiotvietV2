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
