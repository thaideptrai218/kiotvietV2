-- ===============================================
-- V6: Insert Sample Products for Development
-- ===============================================
-- Creates 50 sample products with minimal required fields
-- Only includes essential fields to avoid dependency issues

INSERT INTO products (sku, name, description, selling_price, cost_price, on_hand, min_level, max_level, is_tracked, status, category_id, brand_id, supplier_id, created_at, updated_at, account_id) VALUES
('COFFEE-TRUNG-LEGEND-500G', 'Trung Nguyen Legend Coffee 500g', 'Premium Vietnamese coffee', 285000, 195000, 150, 30, 300, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('COFFEE-HIGHLANDS-CLASSIC-200G', 'Highlands Classic Coffee 200g', 'Premium instant coffee', 125000, 85000, 200, 50, 500, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('COFFEE-TAN-HIEP-PHIN-3IN1', 'Tan Hiep Phin Instant Coffee', 'Vietnamese instant coffee', 45000, 32000, 300, 100, 600, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('DRINK-NUMBER1-ORANGE-330ML', 'Number 1 Energy Drink Orange', 'Energy drink', 25000, 18000, 100, 30, 200, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('WATER-LAVIE-500ML', 'La Vie Natural Water 500ml', 'Mineral water', 12000, 8000, 500, 100, 1000, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Computer Accessories
('MOUSE-LOGI-MX3S-GRAPHITE', 'Logitech MX Master 3S', 'Wireless mouse', 3290000, 2490000, 80, 20, 150, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('KEYBOARD-KEYCHRON-K8-PRO-BROWN', 'Keychron K8 Pro', 'Mechanical keyboard', 4490000, 3290000, 45, 10, 80, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('GPU-ASUS-ROG-RTX4090-24GB', 'ASUS ROG RTX 4090', 'High-performance GPU', 56990000, 46900000, 8, 2, 20, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('STORAGE-SAMSUNG-980-PRO-2TB', 'Samsung 980 PRO 2TB SSD', 'Ultra-fast SSD', 12990000, 9990000, 25, 5, 50, false, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('MONITOR-PHILIPS-27E1-4K', 'Philips 27E1 4K Monitor', 'Professional monitor', 18990000, 14900000, 15, 3, 30, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('CHARGER-ANKER-10000', 'Anker PowerCore 10000', 'Portable charger', 2490000, 1690000, 60, 15, 100, false, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Home & Kitchen
('ROBOT-XIAOMI-S10', 'Xiaomi Robot Vacuum S10', 'Smart robot vacuum', 12990000, 9990000, 20, 5, 40, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('RICE-COOKER-PANASONIC-5-CUP', 'Panasonic Rice Cooker', 'Multi-function rice cooker', 3490000, 2490000, 35, 10, 60, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('AIRFRYER-PHILIPS-XXL', 'Philips Air Fryer XXL', 'Large capacity air fryer', 4490000, 3290000, 25, 5, 40, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('KETTLE-TEFAL-1.7L', 'Tefal Electric Kettle 1.7L', 'Stainless steel kettle', 1890000, 1290000, 45, 10, 80, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('DOORLOCK-XIAOMI-M200', 'Xiaomi Smart Door Lock M200', 'Biometric smart lock', 7990000, 5490000, 30, 5, 50, false, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('FURNITURE-IKEA-MALM-DESK', 'IKEA Malm Desk', 'Home office desk', 3490000, 2490000, 12, 3, 20, false, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Health & Beauty
('HEALTH-OMRON-3-BG', 'Omron Blood Glucose Monitor', 'Glucose monitoring system', 2990000, 1990000, 80, 20, 150, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('TOOTHPASTE-COLGATE-TOTAL-100G', 'Colgate Total Toothpaste', 'Complete oral care', 95000, 65000, 200, 50, 500, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('CREAM-NIVEA-MEN-50ML', 'Nivea Men Face Cream', 'Daily moisturizer', 285000, 195000, 150, 30, 300, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('SHAVER-PANASONIC-ARC5', 'Panasonic ARC5 Shaver', 'Wet/dry electric shaver', 3290000, 2290000, 60, 15, 100, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Summer Cosmetics
('LIPSTICK-MAYB-SUPERSTAY-MATTE', 'Maybelline Superstay Matte Lipstick', 'Long-lasting lipstick', 550000, 380000, 120, 30, 200, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('SUNSCREEN-NIVEA-SPF50-200ML', 'Nivea Sun Protection Spray', 'Water-resistant sunscreen', 485000, 320000, 80, 20, 150, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('MOISTURIZER-OLAY-TOTAL-50ML', 'Olay Total Effects Moisturizer', 'Anti-aging day cream', 699000, 450000, 90, 25, 180, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Water Sports
('SWIM-GOGGLES-SPEEDO-HYDRO', 'Speedo Swimming Goggles', 'Anti-fog goggles', 850000, 550000, 150, 30, 300, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('PADDLEBOARD-TYR-10-6', 'TYR Stand Up Paddleboard', 'Premium paddleboard', 8990000, 6490000, 25, 5, 50, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('SWIM-CAP-ARENA-SILICONE', 'Arena Swim Cap', 'Silicone swim cap', 350000, 220000, 200, 50, 500, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('WETSUIT-BODYGLOVE-3-2MM', 'BodyGlove Wetsuit 3/2mm', 'Warm water wetsuit', 5990000, 3990000, 15, 3, 30, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Office & School Supplies
('MONITOR-DELL-U2422H-24INCH', 'Dell UltraSharp Monitor', 'Office monitor', 12990000, 9990000, 10, 2, 25, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('PRINTER-HP-LASERJET-M404DN', 'HP LaserJet Pro M404dn', 'Network laser printer', 16990000, 12900000, 5, 1, 15, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('PEN-BIC-CRISTAL-BLUE', 'BIC Cristal Pen Blue', 'Ballpoint pen', 45000, 32000, 500, 100, 1000, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('NOTES-POSTIT-3X3-100PADS', 'Post-it Notes 3x3', 'Self-sticking notes', 195000, 145000, 1000, 200, 2000, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('FURNITURE-DESK-CONVERTER', 'Electric Standing Desk Converter', 'Desk converter', 3990000, 2790000, 30, 8, 60, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),

-- Low Stock Products (for testing reorder alerts)
('FLASHLIGHT-LED-EMERGENCY', 'Emergency LED Flashlight', 'Multi-mode flashlight', 550000, 380000, 2, 10, 50, true, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1),
('CABLE-USB-C-PREMIUM-2M', 'Premium USB-C Cable 2M', 'Fast charging cable', 350000, 220000, 3, 1, 25, false, 'ACTIVE', 1, 1, 1, NOW(), NOW(), 1);