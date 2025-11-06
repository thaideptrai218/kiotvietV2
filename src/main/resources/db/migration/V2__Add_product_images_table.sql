-- =============================================
-- PRODUCT IMAGES TABLE
-- Multiple image support for products
-- =============================================

-- Product Images (Multiple images per product)
DROP TABLE IF EXISTS product_images;

CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255), -- Original filename
    image_size BIGINT, -- File size in bytes
    image_type VARCHAR(50), -- jpg, png, webp, etc.
    image_width INT, -- Image dimensions for responsive display
    image_height INT,
    display_order INT DEFAULT 0, -- Ordering for product gallery
    is_primary BOOLEAN DEFAULT FALSE, -- Main product image
    is_active BOOLEAN DEFAULT TRUE,
    alt_text VARCHAR(255), -- For SEO and accessibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, -- For optimistic locking
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_primary (product_id, is_primary),
    INDEX idx_company_product (company_id, product_id),
    INDEX idx_product_order (product_id, display_order),
    INDEX idx_primary_active (is_primary, is_active)
);