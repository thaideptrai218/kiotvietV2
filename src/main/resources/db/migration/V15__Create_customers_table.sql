CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
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
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE KEY uk_customers_company_code (company_id, code),
    INDEX idx_customers_company_phone (company_id, phone),
    INDEX idx_customers_company_name (company_id, name)
);
