-- Seed customers for companies with IDs 1, 2, and 3
-- Codes are unique per company to respect uk_customers_company_code (company_id, code)

-- Company 1
INSERT INTO customers (company_id, code, name, phone, email, address, status)
VALUES
 (1, 'CO1_C001', 'Ethan Clark', '5551000001', 'c1_001@example.com', 'New York', 'ACTIVE'),
 (1, 'CO1_C002', 'Amelia Lewis', '5551000002', 'c1_002@example.com', 'Chicago', 'ACTIVE'),
 (1, 'CO1_C003', 'Mason Walker', '5551000003', 'c1_003@example.com', 'Los Angeles', 'ACTIVE'),
 (1, 'CO1_C004', 'Harper Young', '5551000004', 'c1_004@example.com', 'Seattle', 'ACTIVE'),
 (1, 'CO1_C005', 'Logan King', '5551000005', 'c1_005@example.com', 'Boston', 'ACTIVE');

-- Company 2
INSERT INTO customers (company_id, code, name, phone, email, address, status)
VALUES
 (2, 'CO2_C001', 'Aria Scott', '5552000001', 'c2_001@example.com', 'San Francisco', 'ACTIVE'),
 (2, 'CO2_C002', 'Lucas Green', '5552000002', 'c2_002@example.com', 'San Jose', 'ACTIVE'),
 (2, 'CO2_C003', 'Evelyn Baker', '5552000003', 'c2_003@example.com', 'San Diego', 'ACTIVE'),
 (2, 'CO2_C004', 'Jackson Carter', '5552000004', 'c2_004@example.com', 'Austin', 'ACTIVE'),
 (2, 'CO2_C005', 'Grace Turner', '5552000005', 'c2_005@example.com', 'Dallas', 'ACTIVE');