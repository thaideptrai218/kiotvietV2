-- Create Products, Brands, and Product Images tables for Kiotviet system
-- V5 Migration - Product Management Schema

-- Create brands table first (products will reference it)
CREATE TABLE brands (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    logo_url VARCHAR(500),                       -- For future image upload

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    UNIQUE KEY uk_company_name (company_id, name),
    INDEX idx_company_name (company_id, name),
    INDEX idx_company_active (company_id, is_active)
);

-- Create products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,                    -- Product Number
    name VARCHAR(255) NOT NULL,                  -- Product Name
    barcode VARCHAR(50),                         -- Barcode (optional)
    description TEXT,                            -- Product description

    -- Pricing (decimal for money precision)
    selling_price DECIMAL(12, 2) NOT NULL,       -- Selling price
    cost_price DECIMAL(12, 2) NOT NULL,         -- Cost price

    -- Inventory tracking (company-level for MVP)
    on_hand INT DEFAULT 0,                      -- Current quantity available
    min_level INT DEFAULT 0,                    -- Minimum stock level
    max_level INT DEFAULT 0,                    -- Maximum stock level

    -- Status and flags
    status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE',
    is_tracked BOOLEAN DEFAULT TRUE,             -- Inventory tracking enabled

    -- Relationships
    category_id BIGINT,                          -- FK to categories
    supplier_id BIGINT,                          -- FK to suppliers
    brand_id BIGINT,                             -- FK to brands

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints & Indexes
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE SET NULL,

    UNIQUE KEY uk_company_sku (company_id, sku),
    UNIQUE KEY uk_company_barcode (company_id, barcode),
    INDEX idx_company_name (company_id, name),
    INDEX idx_company_category (company_id, category_id),
    INDEX idx_company_supplier (company_id, supplier_id),
    INDEX idx_company_brand (company_id, brand_id),
    INDEX idx_company_status (company_id, status),
    INDEX idx_company_low_stock (company_id, on_hand, min_level),
    FULLTEXT INDEX ft_product_name (name),
    FULLTEXT INDEX ft_product_search (name, description)
);

-- Create product_images table for future image upload functionality
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,                  -- Denormalization for queries
    image_url VARCHAR(500) NOT NULL,            -- Local file path for MVP
    alt_text VARCHAR(255),
    file_size BIGINT,                           -- Bytes
    image_order INT DEFAULT 0,                  -- Sorting order
    is_primary BOOLEAN DEFAULT FALSE,           -- Main product image

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    INDEX idx_product_order (product_id, image_order),
    INDEX idx_company_product (company_id, product_id)
);

-- Insert sample data only if companies exist (for testing)
-- Use a safe approach that won't fail if no companies exist
INSERT IGNORE INTO brands (company_id, name, description, website)
SELECT c.id, 'Apple', 'Technology company known for iPhone and Mac computers', 'https://www.apple.com'
FROM companies c LIMIT 1;

INSERT IGNORE INTO brands (company_id, name, description, website)
SELECT c.id, 'Samsung', 'South Korean multinational electronics company', 'https://www.samsung.com'
FROM companies c LIMIT 1;

INSERT IGNORE INTO brands (company_id, name, description, website)
SELECT c.id, 'Sony', 'Japanese multinational conglomerate corporation', 'https://www.sony.com'
FROM companies c LIMIT 1;

INSERT IGNORE INTO brands (company_id, name, description, website)
SELECT c.id, 'LG', 'South Korean electronics company', 'https://www.lg.com'
FROM companies c LIMIT 1;

INSERT IGNORE INTO brands (company_id, name, description, website)
SELECT c.id, 'Xiaomi', 'Chinese electronics company', 'https://www.mi.com'
FROM companies c LIMIT 1;