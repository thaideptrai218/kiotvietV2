-- =============================================
-- V6__Create_categories_table.sql
-- Purpose: Hierarchical category management with materialized path
-- =============================================

DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Hierarchical structure using materialized path
    -- Path format: "/root-category/sub-category/sub-sub-category"
    -- Examples: "/drinks", "/drinks/soft-drinks", "/drinks/soft-drinks/coke"
    path VARCHAR(500) NOT NULL,

    -- Tree structure references
    parent_id BIGINT,
    level INT DEFAULT 0,           -- 0 = root level, 1 = first level, etc.
    sort_order INT DEFAULT 0,      -- Order within siblings

    -- Category properties
    color VARCHAR(7),              -- Hex color code for UI (optional)
    icon VARCHAR(50),              -- Icon class for UI (optional)

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints & Indexes
    CONSTRAINT fk_category_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE,
    CONSTRAINT uk_company_name_parent UNIQUE (company_id, name(191), parent_id),

    -- Performance indexes for multi-tenant queries
    INDEX idx_company_path (company_id, path(191)),
    INDEX idx_company_parent (company_id, parent_id),
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_company_level (company_id, level),
    INDEX idx_path_descendants (path(191)),  -- For finding descendants

    -- Full-text search on category name
    FULLTEXT INDEX ft_category_name (name)
);

-- Insert default root categories for demonstration
-- These will be created per company in the application layer
-- This is just reference data for structure understanding