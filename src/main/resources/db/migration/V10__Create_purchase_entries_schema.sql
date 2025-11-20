-- V10 Migration - Purchase Entries (Header/Lines/Payments)
-- Purpose: Implement core schema for Purchase Entry workflow (MVP)

-- =========================
-- Table: purchase_entries
-- =========================
CREATE TABLE purchase_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,

    code VARCHAR(50),                              -- Human-readable code (unique per company)
    status ENUM('DRAFT','CONFIRMED','PARTIALLY_RECEIVED','RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',

    bill_date DATE NOT NULL,                       -- Supplier bill/invoice date
    due_date DATE NULL,                            -- Payment due date (optional)
    reference_no VARCHAR(100),                     -- Supplier reference/bill number
    notes TEXT,

    -- Currency & totals
    currency VARCHAR(10) DEFAULT 'VND',
    subtotal DECIMAL(15,2) DEFAULT 0.00,           -- Sum of (qty * unit_cost) per line BEFORE discounts/tax/expenses
    discount_total DECIMAL(15,2) DEFAULT 0.00,     -- Invoice-level discount
    tax_total DECIMAL(15,2) DEFAULT 0.00,          -- Sum of line-level taxes (MVP per-line tax)
    supplier_expense DECIMAL(15,2) DEFAULT 0.00,   -- Expenses charged by supplier (shipping/unloading)
    other_expense DECIMAL(15,2) DEFAULT 0.00,      -- Other inbound costs not charged by supplier
    grand_total DECIMAL(15,2) DEFAULT 0.00,        -- subtotal - discount_total + tax_total + supplier_expense + other_expense

    amount_paid DECIMAL(15,2) DEFAULT 0.00,        -- Amount paid at entry time (initial payment)
    amount_due DECIMAL(15,2) DEFAULT 0.00,         -- grand_total - amount_paid (tracked for payables)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchase_entry_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_entry_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE RESTRICT,
    CONSTRAINT uk_company_code UNIQUE (company_id, code),
    INDEX idx_company_status_date (company_id, status, bill_date),
    INDEX idx_company_supplier_date (company_id, supplier_id, bill_date),
    INDEX idx_company_code (company_id, code)
);

-- ==============================
-- Table: purchase_entry_lines
-- ==============================
CREATE TABLE purchase_entry_lines (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    purchase_entry_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    description VARCHAR(255),                      -- Override name/extra description (optional)
    qty_ordered INT NOT NULL DEFAULT 0,
    qty_received INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL,              -- Purchase unit cost
    discount_amount DECIMAL(12,2) DEFAULT 0.00,    -- Per-line discount (amount)
    discount_percent DECIMAL(5,2) DEFAULT 0.00,    -- Per-line discount (%) informational
    tax_percent DECIMAL(5,2) DEFAULT 0.00,         -- Per-line tax (%) informational
    line_total DECIMAL(15,2) DEFAULT 0.00,         -- Calculated line total for reporting

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purch_line_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_purch_line_entry FOREIGN KEY (purchase_entry_id) REFERENCES purchase_entries (id) ON DELETE CASCADE,
    CONSTRAINT fk_purch_line_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
    INDEX idx_entry_lines_entry (purchase_entry_id),
    INDEX idx_company_product (company_id, product_id)
);

-- ===========================
-- Table: purchase_payments
-- ===========================
CREATE TABLE purchase_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    purchase_entry_id BIGINT NOT NULL,

    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) DEFAULT 'CASH',              -- CASH/BANK/OTHER (flexible string for MVP)
    amount DECIMAL(15,2) NOT NULL,
    reference VARCHAR(100),
    note VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purch_payment_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_purch_payment_entry FOREIGN KEY (purchase_entry_id) REFERENCES purchase_entries (id) ON DELETE CASCADE,
    INDEX idx_payment_entry_paid_at (purchase_entry_id, paid_at),
    INDEX idx_company_paid_at (company_id, paid_at)
);

-- Notes:
-- - Inventory updates will be handled at application layer when status transitions to RECEIVED.
-- - For performance, totals are stored denormalized on purchase_entries and maintained by the service layer.
-- - Future: add inventory_movements table for auditable stock changes.

