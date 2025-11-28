CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(500),
    ward VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20),
    tax_code VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES companies(id),
    UNIQUE KEY uk_customers_account_code (account_id, code),
    INDEX idx_customers_account_phone (account_id, phone),
    INDEX idx_customers_account_name (account_id, name)
);
