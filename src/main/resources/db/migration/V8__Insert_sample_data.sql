-- =============================================
-- V8__Insert_sample_data.sql
-- Purpose: Insert comprehensive sample data for testing and development
-- Includes: companies, users, branches, categories, suppliers, and products
-- =============================================

-- ============= SAMPLE COMPANIES =============
-- Insert sample companies for testing
INSERT IGNORE INTO companies (id, name, email, phone, address, tax_code, is_active) VALUES
(1, 'Cửa hàng ABC', 'contact@cuahangabc.vn', '0912345678', '123 Nguyễn Huệ, Quận 1, TP.HCM', '0301234567', TRUE),
(2, 'Tạp hóa An Phát', 'info@taphoanphat.vn', '0923456789', '456 Trần Hưng Đạo, Quận 5, TP.HCM', '0309876543', TRUE),
(3, 'Siêu thị Tiện Lợi', 'admin@sieuthitienloi.vn', '0934567890', '789 Lê Lợi, Quận 3, TP.HCM', '0304567891', TRUE);

-- ============= SAMPLE BRANCHES =============
INSERT IGNORE INTO branches (id, company_id, name, code, address, phone, email, is_active) VALUES
-- Branches for Company 1 (Cửa hàng ABC)
(1, 1, 'Chi nhánh chính', 'CN001', '123 Nguyễn Huệ, Quận 1, TP.HCM', '0912345678', 'cn1@cuahangabc.vn', TRUE),
(2, 1, 'Chi nhánh Quận 3', 'CN002', '456 Cách Mạng Tháng Tám, Quận 3, TP.HCM', '0912345679', 'cn2@cuahangabc.vn', TRUE),

-- Branches for Company 2 (Tạp hóa An Phát)
(3, 2, 'Cửa hàng chính', 'TH001', '456 Trần Hưng Đạo, Quận 5, TP.HCM', '0923456789', 'main@taphoanphat.vn', TRUE),

-- Branches for Company 3 (Siêu thị Tiện Lợi)
(4, 3, 'Điểm bán Quận 1', 'STL001', '789 Lê Lợi, Quận 3, TP.HCM', '0934567890', 'store1@sieuthitienloi.vn', TRUE),
(5, 3, 'Điểm bán Quận 7', 'STL002', '321 Nguyễn Thị Thập, Quận 7, TP.HCM', '0934567891', 'store2@sieuthitienloi.vn', TRUE);

-- ============= SAMPLE USERS =============
INSERT IGNORE INTO user_info (id, company_id, username, email, full_name, phone, role, is_active) VALUES
-- Admin users
(1, 1, 'admin_abc', 'admin@cuahangabc.vn', 'Nguyễn Văn Admin', '0912345678', 'admin', TRUE),
(2, 2, 'admin_anphat', 'admin@taphoanphat.vn', 'Trần Thị Admin', '0923456789', 'admin', TRUE),
(3, 3, 'admin_stl', 'admin@sieuthitienloi.vn', 'Lê Văn Admin', '0934567890', 'admin', TRUE),

-- Manager users
(4, 1, 'manager_abc', 'manager@cuahangabc.vn', 'Phạm Thị Manager', '0912345677', 'manager', TRUE),
(5, 3, 'manager_stl', 'manager@sieuthitienloi.vn', 'Hoàng Văn Manager', '0934567889', 'manager', TRUE),

-- Staff users
(6, 1, 'staff1_abc', 'staff1@cuahangabc.vn', 'Nhân Viên 1', '0912345676', 'staff', TRUE),
(7, 1, 'staff2_abc', 'staff2@cuahangabc.vn', 'Nhân Viên 2', '0912345675', 'staff', TRUE),
(8, 2, 'staff_anphat', 'staff@taphoanphat.vn', 'Nhân Viên An Phát', '0923456788', 'staff', TRUE),
(9, 3, 'staff1_stl', 'staff1@sieuthitienloi.vn', 'Nhân Viên STL 1', '0934567888', 'staff', TRUE),
(10, 3, 'staff2_stl', 'staff2@sieuthitienloi.vn', 'Nhân Viên STL 2', '0934567887', 'staff', TRUE);

-- ============= SAMPLE USER AUTH =============
-- Password: admin123 (hashed with BCrypt)
INSERT IGNORE INTO user_auth (user_info_id, password_hash, salt, two_factor_enabled) VALUES
(1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(2, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(3, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(4, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(5, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(6, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(7, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(8, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(9, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE),
(10, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'salt123', FALSE);

-- ============= SAMPLE CATEGORIES =============
INSERT IGNORE INTO categories (id, company_id, name, description, path, parent_id, level, sort_order, is_active) VALUES
-- Company 1 Categories
(1, 1, 'Đồ uống', 'Các loại nước giải khát', '/do-uong', NULL, 0, 1, TRUE),
(2, 1, 'Thực phẩm khô', 'Thực phẩm khô và đóng hộp', '/thuc-pham-kho', NULL, 0, 2, TRUE),
(3, 1, 'Đồ ăn vặt', 'Bánh kẹo và đồ ăn vặt', '/do-an-vat', NULL, 0, 3, TRUE),
(4, 1, 'Chất tẩy rửa', 'Sản phẩm tẩy rửa và vệ sinh', '/chat-tay-rua', NULL, 0, 4, TRUE),
(5, 1, 'Nước ngọt', 'Các loại nước ngọt có ga', '/do-uong/nuoc-ngot', 1, 1, 1, TRUE),
(6, 1, 'Trà và cà phê', 'Trà túi lọc và cà phê hòa tan', '/do-uong/tra-va-cafe', 1, 2, 2, TRUE),
(7, 1, 'Bánh kẹo', 'Các loại bánh và kẹo', '/do-an-vat/banh-keo', 3, 1, 1, TRUE),
(8, 1, 'Mì gói', 'Mì ăn liền và mì gói', '/thuc-pham-kho/mi-goi', 2, 1, 1, TRUE),

-- Company 2 Categories
(9, 2, 'Rau củ quả', 'Rau củ quả tươi', '/rau-cu-qua', NULL, 0, 1, TRUE),
(10, 2, 'Thịt và cá', 'Thịt tươi và hải sản', '/thit-va-ca', NULL, 0, 2, TRUE),
(11, 2, 'Gạo và ngũ cốc', 'Các loại gạo và ngũ cốc', '/gao-va-ngu-coc', NULL, 0, 3, TRUE),
(12, 2, 'Gia vị', 'Các loại gia vị nấu ăn', '/gia-vi', NULL, 0, 4, TRUE),

-- Company 3 Categories
(13, 3, 'Điện tử', 'Đồ điện tử gia dụng', '/dien-tu', NULL, 0, 1, TRUE),
(14, 3, 'Quần áo', 'Thời trang và quần áo', '/quan-ao', NULL, 0, 2, TRUE),
(15, 3, 'Sách và văn phòng', 'Sách và dụng cụ văn phòng', '/sach-va-van-phong', NULL, 0, 3, TRUE);

-- ============= SAMPLE SUPPLIERS =============
INSERT IGNORE INTO suppliers (id, company_id, name, contact_person, phone, email, address, tax_code, website, notes, outstanding_balance, credit_limit, is_active) VALUES
-- Company 1 Suppliers
(1, 1, 'Công ty TNHH Thực phẩm An Lành', 'Ông An', '0901234567', 'anlanh@food.vn', '123 Bình Tân, TP.HCM', '0301111111', 'http://anlanh.vn', 'Nhà cung cấp uy tín lâu năm', 15000000.00, 50000000.00, TRUE),
(2, 1, 'Tổng công ty Bia Sài Gòn', 'Bà Sài Gòn', '0902345678', 'saigonbeer@beer.vn', '456 Thủ Đức, TP.HCM', '0302222222', 'http://saigonbeer.com.vn', 'Nhà cung cấp bia chính thức', 8500000.00, 30000000.00, TRUE),
(3, 1, 'Công ty CP Đồ uống Tân Hiệp Phát', 'Ông Hiệp', '0903456789', 'tanphat@drink.vn', '789 Biên Hòa, Đồng Nai', '0303333333', 'http://tanhihpphat.com.vn', 'Nhà cung cấp trà và nước ngọt', 12300000.00, 40000000.00, TRUE),
(4, 1, 'Công ty OMO', 'Bà OMO', '0904567890', 'omo@unilever.vn', '321 Nhơn Trạch, Đồng Nai', '0304444444', 'http://omo.vn', 'Bột giặt và chất tẩy rửa', 6700000.00, 25000000.00, TRUE),

-- Company 2 Suppliers
(5, 2, 'Hợp tác xã Nông nghiệp Việt', 'Ông Nông', '0911234567', 'vietcoop@agri.vn', '123 Hóc Môn, TP.HCM', '0305555555', NULL, 'Cung cấp rau củ quả sạch', 4500000.00, 20000000.00, TRUE),
(6, 2, 'Chợ đầu mối Bình Điền', 'Bà Bình', '0912345678', 'binhdien@market.vn', '456 Bình Thạnh, TP.HCM', '0306666666', NULL, 'Thịt và hải sản tươi sống', 8900000.00, 35000000.00, TRUE),

-- Company 3 Suppliers
(7, 3, 'Thế Giới Di Động', 'Ông Di Động', '0921234567', 'tgdđ@tgdd.vn', '789 Quận 1, TP.HCM', '0307777777', 'http://thegioididong.com', 'Đồ điện tử và gia dụng', 45000000.00, 100000000.00, TRUE),
(8, 3, 'FPT Shop', 'Bà FPT', '0922345678', 'fptshop@fpt.vn', '321 Quận 3, TP.HCM', '0308888888', 'http://fptshop.com.vn', 'Laptop và thiết bị văn phòng', 32000000.00, 80000000.00, TRUE);

-- ============= SAMPLE BRANDS (Additional to existing ones) =============
INSERT IGNORE INTO brands (company_id, name, description, website) VALUES
(1, 'Coca-Cola', 'Thương hiệu nước ngọt toàn cầu', 'https://www.coca-cola.com.vn'),
(1, 'Pepsi', 'Thương hiệu nước ngọt nổi tiếng', 'https://www.pepsi.com.vn'),
(1, 'Lavie', 'Thương hiệu nước khoáng của Nestlé', 'https://www.lavie.com.vn'),
(1, 'Vinamilk', 'Công ty sữa lớn nhất Việt Nam', 'https://www.vinamilk.com.vn'),
(1, 'Hảo Hảo', 'Thương hiệu mì gói nổi tiếng', 'https://www.haohao.vn'),
(1, 'Kinder', 'Thương hiệu bánh kẹo của Ferrero', 'https://www.kinder.com'),
(1, 'OMO', 'Bột giặt và chất tẩy rửa', 'https://www.omo.vn'),
(1, 'Sunlight', 'Nước rửa chén và chất tẩy rửa', 'https://www.sunlight.vn'),

(2, 'Saigon Co.op', 'Hệ thống siêu thị hợp tác xã', 'https://www.saigonco-op.com.vn'),
(2, 'Vissan', 'Thực phẩm chế biến', 'https://www.vissan.com.vn'),

(3, 'Apple', 'Công ty công nghệ Mỹ', 'https://www.apple.com'),
(3, 'Dell', 'Công ty máy tính Mỹ', 'https://www.dell.com'),
(3, 'Samsung', 'Tập đoàn điện tử Hàn Quốc', 'https://www.samsung.com'),
(3, 'Nike', 'Thương hiệu thời trang thể thao', 'https://www.nike.com'),
(3, 'Adidas', 'Thương hiệu thời trang thể thao', 'https://www.adidas.com');

-- ============= SAMPLE PRODUCTS =============
-- Company 1 Products (Convenience Store)
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id, brand_id) VALUES
-- Đồ uống
(1, 'NU001', 'Coca-Cola 390ml', '8934567890123', 'Nước ngọt Coca-Cola lon 390ml', 12000.00, 9500.00, 150, 20, 300, 'ACTIVE', TRUE, 5, 2, 1),
(1, 'NU002', 'Pepsi 390ml', '8934567890124', 'Nước ngọt Pepsi lon 390ml', 12000.00, 9500.00, 120, 20, 250, 'ACTIVE', TRUE, 5, 2, 2),
(1, 'NU003', 'Lavie 350ml', '8934567890125', 'Nước khoáng Lavie chai 350ml', 8000.00, 6000.00, 200, 30, 400, 'ACTIVE', TRUE, 1, 1, 4),
(1, 'NU004', 'Trà xanh Không Độ 490ml', '8934567890126', 'Trà xanh 0 độ chai 490ml', 15000.00, 12000.00, 80, 15, 200, 'ACTIVE', TRUE, 6, 3, 3),
(1, 'NU005', 'Cà phê G7 3in1', '8934567890127', 'Cà phê hòa tan G7 3in1 gói 16g', 5000.00, 3800.00, 300, 50, 600, 'ACTIVE', TRUE, 6, 3, 3),

-- Đồ ăn vặt
(1, 'DV001', 'Bánh quy Cosy', '8934567890128', 'Bánh quy bơ Cosy hộp 168g', 25000.00, 20000.00, 60, 10, 150, 'ACTIVE', TRUE, 7, 1, 1),
(1, 'DV002', 'Kinder Bueno', '8934567890129', 'Bánh sô cô la Kinder Bueno 2 thanh', 35000.00, 28000.00, 40, 8, 100, 'ACTIVE', TRUE, 7, 1, 6),
(1, 'DV003', 'Kẹo Mentos', '8934567890130', 'Kẹo dẻo Mentos hộp 34g', 12000.00, 9000.00, 100, 20, 200, 'ACTIVE', TRUE, 7, 1, 6),

-- Thực phẩm khô
(1, 'TK001', 'Mì Hảo Hảo tôm chua cay', '8934567890131', 'Mì ăn liền Hảo Hảo vị tôm chua cay gói 75g', 3500.00, 2800.00, 500, 80, 1000, 'ACTIVE', TRUE, 8, 1, 5),
(1, 'TK002', 'Mì Omachi', '8934567890132', 'Mì ăn liền Omosi Omachi gói 75g', 4500.00, 3500.00, 200, 30, 400, 'ACTIVE', TRUE, 8, 1, 1),

-- Chất tẩy rửa
(1, 'CTR001', 'Bột giặt OMO 400g', '8934567890133', 'Bột giặt OMO chuyên lạnh 400g', 25000.00, 20000.00, 50, 8, 120, 'ACTIVE', TRUE, 4, 4, 7),
(1, 'CTR002', 'Nước rửa chén Sunlight 500ml', '8934567890134', 'Nước rửa chén Sunlight chai 500ml', 18000.00, 14000.00, 80, 15, 180, 'ACTIVE', TRUE, 4, 4, 8);

-- Company 2 Products (Fresh Food)
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id) VALUES
-- Rau củ quả
(2, 'RC001', 'Cà chua', '8934567890135', 'Cà chua tươi 1kg', 25000.00, 20000.00, 30, 10, 60, 'ACTIVE', TRUE, 9, 5),
(2, 'RC002', 'Dưa leo', '8934567890136', 'Dưa leo tươi 1kg', 20000.00, 16000.00, 25, 8, 50, 'ACTIVE', TRUE, 9, 5),
(2, 'RC003', 'Rau muống', '8934567890137', 'Rau muống tươi 1kg', 15000.00, 12000.00, 40, 12, 80, 'ACTIVE', TRUE, 9, 5),
(2, 'RC004', 'Ớt chuông đỏ', '8934567890138', 'Ớt chuông đỏ tươi 500g', 30000.00, 24000.00, 20, 5, 40, 'ACTIVE', TRUE, 9, 5),

-- Thịt và cá
(2, 'TC001', 'Thịt ba chỉ heo', '8934567890139', 'Thịt ba chỉ heo tươi 1kg', 120000.00, 100000.00, 15, 3, 30, 'ACTIVE', TRUE, 10, 6),
(2, 'TC002', 'Cá diêu hồng', '8934567890140', 'Cá diêu hồng tươi 1kg', 80000.00, 65000.00, 20, 4, 40, 'ACTIVE', TRUE, 10, 6),

-- Gạo và ngũ cốc
(2, 'GN001', 'Gạo ST25', '8934567890141', 'Gạo ST25 5kg', 250000.00, 200000.00, 25, 5, 50, 'ACTIVE', TRUE, 11, 5),
(2, 'GN002', 'Ngũ cốc dinh dưỡng', '8934567890142', 'Ngũ cốc dinh dưỡng hộp 500g', 80000.00, 65000.00, 30, 6, 60, 'ACTIVE', TRUE, 11, 5),

-- Gia vị
(2, 'GV001', 'Nước mắm Nam Ngư', '8934567890143', 'Nước mắm Nam Ngư chai 500ml', 35000.00, 28000.00, 50, 10, 100, 'ACTIVE', TRUE, 12, 5),
(2, 'GV002', 'Bột nêm Knorr', '8934567890144', 'Bột nêm Knorr hũ 200g', 18000.00, 14000.00, 60, 12, 120, 'ACTIVE', TRUE, 12, 5);

-- Company 3 Products (Retail Store)
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id, brand_id) VALUES
-- Điện tử
(3, 'DT001', 'iPhone 15 128GB', '1942538456123', 'iPhone 15 128GB màu xanh', 25000000.00, 22000000.00, 10, 2, 25, 'ACTIVE', TRUE, 13, 7, 3),
(3, 'DT002', 'Samsung Galaxy S24', '8806094750149', 'Samsung Galaxy S24 256GB', 22000000.00, 19000000.00, 8, 2, 20, 'ACTIVE', TRUE, 13, 7, 3),
(3, 'DT003', 'Dell Inspiron 15', '8841162873717', 'Laptop Dell Inspiron 15', 18000000.00, 15000000.00, 5, 1, 15, 'ACTIVE', TRUE, 13, 8, 4),

-- Quần áo
(3, 'QA001', 'Áo thun Nike', '0196435071123', 'Áo thun Nike nam size L', 650000.00, 500000.00, 20, 5, 50, 'ACTIVE', TRUE, 14, 7, 5),
(3, 'QA002', 'Giày Adidas', '4062550140550', 'Giày Adidas Ultraboost', 2500000.00, 2000000.00, 15, 3, 30, 'ACTIVE', TRUE, 14, 7, 6),
(3, 'QA003', 'Quần jeans Levi\'s', '0736267340482', 'Quần jeans Levi\'s 501', 1500000.00, 1200000.00, 25, 5, 60, 'ACTIVE', TRUE, 14, 7, 1),

-- Sách và văn phòng
(3, 'SVVP001', 'Bút bi Ball Point', '8938506123456', 'Bút bi Ball Point xanh', 5000.00, 3500.00, 200, 30, 400, 'ACTIVE', TRUE, 15, 8, 2),
(3, 'SVVP002', 'Tập A4 200 trang', '8938506123457', 'Tập học sinh A4 200 trang', 12000.00, 9000.00, 150, 25, 300, 'ACTIVE', TRUE, 15, 8, 2),
(3, 'SVVP003', 'Sách Harry Potter 1', '9780747532699', 'Harry Potter và Hòn đá Phù thủy', 150000.00, 120000.00, 30, 5, 80, 'ACTIVE', TRUE, 15, 8, 2);

-- ============= SAMPLE PRODUCT IMAGES =============
INSERT IGNORE INTO product_images (product_id, company_id, image_url, alt_text, file_size, image_order, is_primary) VALUES
-- Product images for Company 1
(1, 1, '/uploads/products/coca-cola-390ml.jpg', 'Coca-Cola lon 390ml', 245760, 1, TRUE),
(2, 1, '/uploads/products/pepsi-390ml.jpg', 'Pepsi lon 390ml', 234567, 1, TRUE),
(3, 1, '/uploads/products/lavie-350ml.jpg', 'Nước khoáng Lavie 350ml', 198765, 1, TRUE),
(6, 1, '/uploads/products/kinder-bueno.jpg', 'Bánh sô cô la Kinder Bueno', 287654, 1, TRUE),
(11, 1, '/uploads/products/omo-400g.jpg', 'Bột giặt OMO 400g', 345678, 1, TRUE),

-- Product images for Company 2
(14, 2, '/uploads/products/ca-chua-tuoi.jpg', 'Cà chua tươi', 156789, 1, TRUE),
(15, 2, '/uploads/products/dua-leo-tuoi.jpg', 'Dưa leo tươi', 145678, 1, TRUE),
(19, 2, '/uploads/products/gao-st25.jpg', 'Gạo ST25 5kg', 234567, 1, TRUE),

-- Product images for Company 3
(25, 3, '/uploads/products/iphone-15-128gb.jpg', 'iPhone 15 128GB màu xanh', 567890, 1, TRUE),
(26, 3, '/uploads/products/samsung-s24.jpg', 'Samsung Galaxy S24 256GB', 578901, 1, TRUE),
(28, 3, '/uploads/products/ao-thun-nike.jpg', 'Áo thun Nike nam', 234567, 1, TRUE),
(29, 3, '/uploads/products/giay-adidas.jpg', 'Giày Adidas Ultraboost', 456789, 1, TRUE);

-- Update statistics and verification queries at the end
-- Note: Total records inserted:
-- - Companies: 3
-- - Branches: 5
-- - Users: 10 (with auth records)
-- - Categories: 15 (hierarchical structure)
-- - Suppliers: 8
-- - Brands: 23 (including existing ones)
-- - Products: 25 (with inventory tracking)
-- - Product Images: 12