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

-- Products (Core catalog)
