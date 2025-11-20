-- Orders and Order Items schema

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    customer_name VARCHAR(255),
    phone_number VARCHAR(20),

    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    payment_method ENUM('CASH','TRANSFER','COD','CARD','OTHER') DEFAULT 'CASH',
    status ENUM('DRAFT','COMPLETED','SHIPPING','CANCELLED') DEFAULT 'DRAFT',

    cashier VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    UNIQUE KEY uk_company_order_code (company_id, order_code),
    INDEX idx_company_date (company_id, order_date),
    INDEX idx_company_status (company_id, status),
    INDEX idx_company_customer (company_id, customer_name),
    INDEX idx_company_phone (company_id, phone_number)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT,

    sku VARCHAR(100),
    product_name VARCHAR(255),

    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_company_order (company_id, order_id)
);

