CREATE TABLE inventory_counts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    created_by BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_on_hand INT NOT NULL DEFAULT 0,
    total_actual_count INT NOT NULL DEFAULT 0,
    total_surplus INT NOT NULL DEFAULT 0,
    total_missing INT NOT NULL DEFAULT 0,
    total_diff_qty INT NOT NULL DEFAULT 0,
    total_price_actual DECIMAL(19,2) NOT NULL DEFAULT 0,
    note VARCHAR(1000),
    company_id BIGINT NOT NULL,
    CONSTRAINT uk_inventory_count_company_code UNIQUE (company_id, code)
);

CREATE TABLE inventory_count_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inventory_count_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit VARCHAR(100),
    on_hand INT NOT NULL,
    counted INT NOT NULL,
    diff_qty INT NOT NULL DEFAULT 0,
    diff_cost DECIMAL(19,2) NOT NULL DEFAULT 0,
    company_id BIGINT NOT NULL,
    CONSTRAINT fk_inventory_count_item_parent FOREIGN KEY (inventory_count_id)
        REFERENCES inventory_counts (id) ON DELETE CASCADE
);

CREATE INDEX idx_inventory_counts_company ON inventory_counts (company_id);
CREATE INDEX idx_inventory_counts_code ON inventory_counts (code);
CREATE INDEX idx_inventory_counts_created_at ON inventory_counts (created_at);

CREATE INDEX idx_inventory_count_items_company ON inventory_count_items (company_id);
CREATE INDEX idx_inventory_count_items_product ON inventory_count_items (product_id);
