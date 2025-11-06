-- Active: 1762345532891@@localhost@33006@kiotviet_db
-- =============================================
-- KIOTVIET CORE TABLES - MVP FOUNDATION
-- Multi-tenant Product Management System
-- =============================================

-- ============= MULTI-TENANT ANCHOR =============

-- Companies/Businesses (Tenant management)
CREATE TABLE companies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    tax_code VARCHAR(50), -- Vietnamese tax code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

-- Branches/Stores per Company
CREATE TABLE branches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    UNIQUE KEY uk_company_code (company_id, code),
    INDEX idx_company_active (company_id, is_active)
);

-- ============= USER MANAGEMENT (SPLIT DESIGN) =============

-- User Profile Information
CREATE TABLE user_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    UNIQUE KEY uk_company_username (company_id, username),
    UNIQUE KEY uk_company_email (company_id, email),
    INDEX idx_company_active (company_id, is_active)
);

-- User Authentication Credentials
CREATE TABLE user_auth (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_info_id BIGINT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP NULL,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_info_id) REFERENCES user_info (id) ON DELETE CASCADE,
    INDEX idx_last_login (last_login)
);

-- User Tokens (JWT Refresh & Device Management)
CREATE TABLE user_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_info_id BIGINT NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(500),
    device_type ENUM('web', 'mobile', 'desktop') DEFAULT 'web',
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_info_id) REFERENCES user_info (id) ON DELETE CASCADE,
    INDEX idx_user_expires (user_info_id, expires_at),
    INDEX idx_refresh_token (refresh_token_hash),
    INDEX idx_device_active (user_info_id, is_active)
);

-- ============= PRODUCT MANAGEMENT =============

-- Categories with Materialized Path for Hierarchy
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path VARCHAR(500) NOT NULL, -- Materialized path: /electronics/mobile/phones
    level INT NOT NULL DEFAULT 0, -- Depth in hierarchy: 0=root, 1=child, etc.
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, -- For optimistic locking
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL,
    UNIQUE KEY uk_company_path (company_id, path),
    INDEX idx_company_parent (company_id, parent_id),
    INDEX idx_company_level (company_id, level),
    INDEX idx_path_parent (path, parent_id)
);

-- Products (Core catalog)
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    category_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    description TEXT,
    unit VARCHAR(50) DEFAULT 'piece', -- piece, kg, liter, box, etc.
    cost_price DECIMAL(15, 2) DEFAULT 0,
    selling_price DECIMAL(15, 2) DEFAULT 0,
    weight DECIMAL(10, 3), -- For shipping calculations
    dimensions VARCHAR(50), -- LxWxH format
    brand VARCHAR(100),
    manufacturer VARCHAR(255),
    warranty_months INT DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, -- For optimistic locking
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    UNIQUE KEY uk_company_code (company_id, code),
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_company_category (company_id, category_id),
    INDEX idx_barcode (barcode),
    INDEX idx_brand (brand)
);

-- ============= INVENTORY MANAGEMENT =============

-- Inventory by Branch (Current stock levels)
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock DECIMAL(10, 2) DEFAULT 0, -- Alert threshold
    max_stock DECIMAL(10, 2) DEFAULT 0, -- Maximum capacity
    reorder_point DECIMAL(10, 2) DEFAULT 0, -- When to reorder
    reorder_quantity DECIMAL(10, 2) DEFAULT 0, -- How much to reorder
    average_cost DECIMAL(15, 2) DEFAULT 0, -- Weighted average cost
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, -- For optimistic locking
    FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE KEY uk_branch_product (branch_id, product_id),
    INDEX idx_branch_product (branch_id, product_id),
    INDEX idx_low_stock (
        branch_id,
        quantity,
        min_stock
    ),
    INDEX idx_last_updated (last_updated)
);

-- Inventory Transactions (Complete audit trail)
CREATE TABLE inventory_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    transaction_type ENUM(
        'initial_stock', -- Initial inventory setup
        'stock_in', -- Manual stock increase (purchase, return)
        'stock_out', -- Manual stock decrease (sale, loss)
        'adjustment', -- Inventory correction
        'transfer_in', -- From another branch
        'transfer_out', -- To another branch
        'sale', -- Point of sale
        'return', -- Customer return
        'damage', -- Damaged goods
        'expired' -- Expired goods
    ) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- Positive for IN, Negative for OUT
    quantity_before DECIMAL(10, 2) NOT NULL,
    quantity_after DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) DEFAULT 0, -- Cost per unit at time of transaction
    reference_code VARCHAR(100), -- PO number, invoice number, etc.
    reference_type VARCHAR(50), -- purchase_order, sale, adjustment, etc.
    notes TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches (id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (created_by) REFERENCES user_info (id),
    INDEX idx_company_product (company_id, product_id),
    INDEX idx_branch_type (branch_id, transaction_type),
    INDEX idx_created_date (created_at),
    INDEX idx_reference (
        reference_code,
        reference_type
    )
);