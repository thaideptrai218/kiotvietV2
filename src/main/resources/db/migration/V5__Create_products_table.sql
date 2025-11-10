-- =============================================
-- V5__Create_products_table.sql
-- Purpose: Product management with multi-tenant support
-- =============================================

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,

    -- Basic product information
    barcode VARCHAR(50),
    sku VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Categorization
    category_id BIGINT,
    supplier_id BIGINT,

    -- Pricing information
    price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    taxable BOOLEAN DEFAULT FALSE,

    -- Inventory information
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT NULL,
    unit VARCHAR(50),

    -- Additional attributes
    brand VARCHAR(100),
    tags VARCHAR(500),

    -- Status management
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_product_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL,
    CONSTRAINT uk_company_barcode UNIQUE (company_id, barcode),
    CONSTRAINT uk_company_sku UNIQUE (company_id, sku),
    CONSTRAINT chk_price_non_negative CHECK (price >= 0 AND cost_price >= 0),
    CONSTRAINT chk_stock_non_negative CHECK (stock >= 0 AND min_stock >= 0),
    CONSTRAINT chk_max_stock_valid CHECK (max_stock IS NULL OR max_stock >= min_stock),

    -- Performance indexes for multi-tenant queries
    INDEX idx_company_name (company_id, name),
    INDEX idx_company_category (company_id, category_id),
    INDEX idx_company_supplier (company_id, supplier_id),
    INDEX idx_company_status (company_id, status),
    INDEX idx_company_barcode (company_id, barcode),
    INDEX idx_company_sku (company_id, sku),
    INDEX idx_company_price (company_id, price),
    INDEX idx_company_stock (company_id, stock),
    INDEX idx_company_created (company_id, created_at),

    -- Composite indexes for common filter combinations
    INDEX idx_company_category_status (company_id, category_id, status),
    INDEX idx_company_supplier_status (company_id, supplier_id, status),
    INDEX idx_company_status_stock (company_id, status, stock),

    -- Full-text search indexes
    FULLTEXT INDEX ft_product_name (name),
    FULLTEXT INDEX ft_product_description (description),
    FULLTEXT INDEX ft_product_search (name, description, brand, tags)
);