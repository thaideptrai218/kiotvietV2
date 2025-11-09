-- =============================================
-- V3__Create_suppliers_table.sql
-- Purpose: Supplier information (MVP per tech spec - basic contact only)
-- =============================================

DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints & Indexes
    CONSTRAINT fk_supplier_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT uk_company_name UNIQUE (company_id, name),
    INDEX idx_company_name (company_id, name),
    INDEX idx_company_active (company_id, is_active)
);

-- NOTE: Seed data intentionally omitted to avoid FK errors
-- during fresh migrations where no companies exist yet.
