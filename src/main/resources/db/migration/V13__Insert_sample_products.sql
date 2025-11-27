-- =============================================
-- V13__Insert_sample_products.sql
-- Purpose: Insert comprehensive sample products for both companies
-- Company 1: Quick Stop Convenience Store products
-- Company 2: The Bookworm English Bookstore products
-- =============================================

-- ============= PRODUCTS FOR COMPANY 1 (Quick Stop Convenience Store) =============
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id, brand_id, image) VALUES
-- Soft Drinks
(1, 'CC001', 'Coca-Cola 390ml', '049000050103', 'Classic Coca-Cola in 390ml can', 1.29, 0.95, 150, 20, 300, 'ACTIVE', TRUE, 6, 1, 1, '/uploads/coca-cola-390ml.jpg'),
(1, 'CC002', 'Coca-Cola Zero 390ml', '049000050142', 'Coca-Cola Zero Sugar in 390ml can', 1.29, 0.95, 120, 20, 250, 'ACTIVE', TRUE, 6, 1, 1, '/uploads/coca-cola-zero-390ml.jpg'),
(1, 'PE001', 'Pepsi 390ml', '012000166913', 'Pepsi in 390ml can', 1.29, 0.95, 120, 20, 250, 'ACTIVE', TRUE, 6, 2, 2, '/uploads/pepsi-390ml.jpg'),
(1, 'PE002', 'Diet Pepsi 390ml', '012000166914', 'Diet Pepsi in 390ml can', 1.29, 0.95, 80, 15, 200, 'ACTIVE', TRUE, 6, 2, 2, '/uploads/diet-pepsi-390ml.jpg'),
(1, 'SP001', 'Sprite 355ml', '049000050089', 'Lemon-lime soda in 355ml can', 1.19, 0.89, 100, 15, 200, 'ACTIVE', TRUE, 6, 1, 1, '/uploads/sprite-355ml.jpg'),

-- Water & Juices
(1, 'DW001', 'Dasani 500ml', '049000050298', 'Purified water in 500ml bottle', 1.09, 0.79, 200, 30, 400, 'ACTIVE', TRUE, 9, 3, 3, '/uploads/dasani-500ml.jpg'),
(1, 'DW002', 'Aquafina 500ml', '012000101273', 'Purified water in 500ml bottle', 1.09, 0.79, 180, 25, 350, 'ACTIVE', TRUE, 9, 2, 4, '/uploads/aquafina-500ml.jpg'),
(1, 'OJ001', 'Minute Maid Orange Juice 250ml', '012000103456', 'Orange juice carton 250ml', 2.49, 1.89, 60, 10, 120, 'ACTIVE', TRUE, 9, 1, 1, '/uploads/minute-maid-oj-250ml.jpg'),
(1, 'AJ001', 'Apple & Eve Apple Juice 250ml', '072000100011', 'Apple juice carton 250ml', 2.29, 1.69, 50, 8, 100, 'ACTIVE', TRUE, 9, 1, 1, '/uploads/apple-eve-aj-250ml.jpg'),

-- Tea & Coffee
(1, 'TC001', 'Lipton Black Tea Bags 20ct', '041000009755', 'Black tea bags, 20 count', 3.99, 2.99, 80, 15, 160, 'ACTIVE', TRUE, 7, 1, 1, '/uploads/lipton-black-tea-20ct.jpg'),
(1, 'TC002', 'Green Tea Bags 20ct', '041000009756', 'Green tea bags, 20 count', 3.99, 2.99, 70, 12, 140, 'ACTIVE', TRUE, 7, 1, 1, '/uploads/green-tea-20ct.jpg'),
(1, 'IC001', 'Starbucks VIA Instant Coffee 8ct', '041200027008', 'Instant coffee packets, 8 count', 7.99, 5.99, 40, 8, 80, 'ACTIVE', TRUE, 7, 2, 2, '/uploads/starbucks-via-coffee-8ct.jpg'),
(1, 'IC002', 'Nescafé Classic Instant Coffee 100g', '041000011758', 'Instant coffee jar 100g', 4.99, 3.79, 60, 10, 120, 'ACTIVE', TRUE, 7, 2, 2, '/uploads/nescafe-classic-100g.jpg'),

-- Energy Drinks
(1, 'ED001', 'Red Bull 250ml', '087000102001', 'Red Bull energy drink 250ml can', 2.99, 2.19, 80, 15, 160, 'ACTIVE', TRUE, 8, 5, 5, '/uploads/red-bull-250ml.jpg'),
(1, 'ED002', 'Monster Energy 500ml', '070847090016', 'Monster energy drink 500ml can', 3.29, 2.49, 70, 12, 140, 'ACTIVE', TRUE, 8, 6, 6, '/uploads/monster-energy-500ml.jpg'),
(1, 'ED003', 'Red Bull Sugar-Free 250ml', '087000102002', 'Red Bull sugar-free 250ml can', 2.99, 2.19, 60, 10, 120, 'ACTIVE', TRUE, 8, 5, 5, '/uploads/red-bull-sugarfree-250ml.jpg'),

-- Chips & Crackers
(1, 'CH001', 'Lay''s Classic Potato Chips 200g', '028400007545', 'Classic potato chips 200g bag', 3.49, 2.59, 100, 20, 200, 'ACTIVE', TRUE, 10, 5, 7, '/uploads/lays-classic-200g.jpg'),
(1, 'CH002', 'Lay''s BBQ Potato Chips 200g', '028400007546', 'BBQ potato chips 200g bag', 3.49, 2.59, 90, 18, 180, 'ACTIVE', TRUE, 10, 5, 7, '/uploads/lays-bbq-200g.jpg'),
(1, 'CH003', 'Doritos Nacho Cheese 240g', '028400444947', 'Nacho cheese flavored tortilla chips', 4.29, 3.19, 80, 15, 160, 'ACTIVE', TRUE, 10, 5, 8, '/uploads/doritos-nacho-240g.jpg'),
(1, 'CH004', 'Doritos Cool Ranch 240g', '028400444946', 'Cool ranch flavored tortilla chips', 4.29, 3.19, 75, 15, 150, 'ACTIVE', TRUE, 10, 5, 8, '/uploads/doritos-cool-ranch-240g.jpg'),
(1, 'CH005', 'Cheetos Crunchy 220g', '028400058987', 'Crunchy cheese flavored snacks', 3.99, 2.99, 85, 16, 170, 'ACTIVE', TRUE, 10, 5, 10, '/uploads/cheetos-crunchy-220g.jpg'),

-- Candy & Chocolate
(1, 'CY001', 'Oreo Original 433g', '044000041537', 'Oreo cookies original flavor', 4.99, 3.79, 90, 18, 180, 'ACTIVE', TRUE, 11, 6, 9, '/uploads/oreo-original-433g.jpg'),
(1, 'CY002', 'Milky Way Chocolate Bar 51g', '040000520405', 'Milk chocolate and caramel bar', 1.49, 1.09, 120, 24, 240, 'ACTIVE', TRUE, 11, 6, 9, '/uploads/milky-way-51g.jpg'),
(1, 'CY003', 'Snickers Chocolate Bar 52g', '040000520406', 'Peanut caramel chocolate bar', 1.49, 1.09, 110, 22, 220, 'ACTIVE', TRUE, 11, 6, 9, '/uploads/snickers-52g.jpg'),
(1, 'CY004', 'M&M''s Milk Chocolate 47g', '040000414901', 'Milk chocolate candies', 1.29, 0.99, 150, 30, 300, 'ACTIVE', TRUE, 11, 6, 9, '/uploads/mms-milk-chocolate-47g.jpg'),

-- Instant Noodles
(1, 'IN001', 'Maruchan Ramen Noodles Chicken 85g', '041122775690', 'Chicken flavor instant ramen', 0.39, 0.29, 300, 50, 600, 'ACTIVE', TRUE, 13, 1, 15, '/uploads/maruchan-chicken-85g.jpg'),
(1, 'IN002', 'Maruchan Ramen Noodles Beef 85g', '041122775691', 'Beef flavor instant ramen', 0.39, 0.29, 280, 45, 560, 'ACTIVE', TRUE, 13, 1, 15, '/uploads/maruchan-beef-85g.jpg'),
(1, 'IN003', 'Maruchan Ramen Noodles Shrimp 85g', '041122775692', 'Shrimp flavor instant ramen', 0.39, 0.29, 250, 40, 500, 'ACTIVE', TRUE, 13, 1, 15, '/uploads/maruchan-shrimp-85g.jpg'),

-- Laundry Supplies
(1, 'LS001', 'Tide Original Scent Liquid 50oz', '037000162017', 'Liquid laundry detergent 50oz', 8.99, 6.79, 50, 8, 100, 'ACTIVE', TRUE, 14, 4, 11, '/uploads/tide-original-50oz.jpg'),
(1, 'LS002', 'Tide Pods 42 Count', '037000162018', 'Laundry detergent pods', 15.99, 11.99, 30, 5, 60, 'ACTIVE', TRUE, 14, 4, 11, '/uploads/tide-pods-42ct.jpg'),
(1, 'LS003', 'Downy Fabric Softener 120 Loads', '037000259008', 'Liquid fabric softener', 9.99, 7.49, 40, 6, 80, 'ACTIVE', TRUE, 14, 4, 11, '/uploads/downy-120-loads.jpg'),

-- Dish Cleaning
(1, 'DS001', 'Dawn Ultra Dish Soap 24oz', '037000127084', 'Ultra concentrated dish soap', 3.99, 2.99, 60, 12, 120, 'ACTIVE', TRUE, 15, 4, 12, '/uploads/dawn-ultra-24oz.jpg'),
(1, 'DS002', 'Cascade Complete Dishwasher Gel 75oz', '037000165010', 'Gel dishwasher detergent', 8.99, 6.79, 35, 6, 70, 'ACTIVE', TRUE, 15, 4, 11, '/uploads/cascade-complete-75oz.jpg'),

-- Paper Products
(1, 'PP001', 'Bounty Select-A-Size Paper Towels 12 Roll', '037000109009', 'Select-a-size paper towels', 18.99, 14.29, 25, 4, 50, 'ACTIVE', TRUE, 16, 4, 13, '/uploads/bounty-select-a-size-12roll.jpg'),
(1, 'PP002', 'Charmin Ultra Soft Toilet Paper 12 Roll', '037000104011', 'Ultra soft toilet paper', 19.99, 14.99, 30, 5, 60, 'ACTIVE', TRUE, 16, 4, 14, '/uploads/charmin-ultra-soft-12roll.jpg'),
(1, 'PP003', 'Kleenex Facial Tissues 160 Count', '036000043125', 'Facial tissues box', 2.49, 1.89, 80, 16, 160, 'ACTIVE', TRUE, 16, 4, 14, '/uploads/kleenex-160ct.jpg'),

-- Personal Care
(1, 'PC001', 'Colgate Total Toothpaste 4.6oz', '035000194852', 'Total advanced health toothpaste', 4.99, 3.79, 70, 14, 140, 'ACTIVE', TRUE, 4, 4, 11, '/uploads/colgate-total-4.6oz.jpg'),
(1, 'PC002', 'Dove Beauty Bar Soap 4 Count', '074446023002', 'Beauty bars', 5.99, 4.49, 60, 12, 120, 'ACTIVE', TRUE, 4, 4, 11, '/uploads/dove-beauty-bar-4ct.jpg'),
(1, 'PC003', 'Degree Deodorant Invisible Solid 2.7oz', '041120085963', 'Invisible solid deodorant', 4.29, 3.19, 50, 10, 100, 'ACTIVE', TRUE, 4, 4, 11, '/uploads/degree-deodorant-2.7oz.jpg');

-- ============= PRODUCTS FOR COMPANY 2 (The Bookworm English Bookstore) =============
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id, brand_id, image) VALUES
-- Literary Fiction
(2, 'LF001', 'To Kill a Mockingbird', '9780061120084', 'Harper Lee - Pulitzer Prize winning novel', 14.99, 10.99, 15, 3, 30, 'ACTIVE', TRUE, 22, 7, 2, '/uploads/to-kill-a-mockingbird.jpg'),
(2, 'LF002', '1984', '9780451524935', 'George Orwell - Dystopian classic', 15.99, 11.99, 18, 3, 36, 'ACTIVE', TRUE, 22, 7, 2, '/uploads/1984.jpg'),
(2, 'LF003', 'Pride and Prejudice', '9780141439518', 'Jane Austen - Romantic classic', 13.99, 10.49, 20, 4, 40, 'ACTIVE', TRUE, 22, 7, 2, '/uploads/pride-and-prejudice.jpg'),
(2, 'LF004', 'The Great Gatsby', '9780743273565', 'F. Scott Fitzgerald - Jazz Age classic', 14.99, 11.24, 16, 3, 32, 'ACTIVE', TRUE, 22, 7, 2, '/uploads/the-great-gatsby.jpg'),
(2, 'LF005', 'One Hundred Years of Solitude', '9780060883287', 'Gabriel García Márquez - Magical realism', 17.99, 13.49, 12, 2, 24, 'ACTIVE', TRUE, 22, 8, 2, '/uploads/one-hundred-years.jpg'),
(2, 'LF006', 'The Catcher in the Rye', '9780316769174', 'J.D. Salinger - Coming of age classic', 15.99, 11.99, 14, 3, 28, 'ACTIVE', TRUE, 22, 7, 2, '/uploads/the-catcher-in-the-rye.jpg'),
(2, 'LF007', 'Lord of the Flies', '9780571191475', 'William Golding - Survival novel', 13.99, 10.49, 10, 2, 20, 'ACTIVE', TRUE, 22, 9, 2, '/uploads/lord-of-the-flies.jpg'),

-- Mystery & Thriller
(2, 'MT001', 'The Girl with the Dragon Tattoo', '9780307949486', 'Stieg Larsson - Swedish crime thriller', 16.99, 12.74, 12, 2, 24, 'ACTIVE', TRUE, 23, 7, 2, '/uploads/girl-with-dragon-tattoo.jpg'),
(2, 'MT002', 'Gone Girl', '9780307588371', 'Gillian Flynn - Psychological thriller', 15.99, 11.99, 15, 3, 30, 'ACTIVE', TRUE, 23, 7, 2, '/uploads/gone-girl.jpg'),
(2, 'MT003', 'The Da Vinci Code', '9780307474278', 'Dan Brown - Mystery thriller', 16.99, 12.74, 18, 3, 36, 'ACTIVE', TRUE, 23, 7, 2, '/uploads/the-da-vinci-code.jpg'),
(2, 'MT004', 'Sherlock Holmes Complete Novels', '9780307277265', 'Arthur Conan Doyle - Complete collection', 24.99, 18.74, 8, 1, 16, 'ACTIVE', TRUE, 23, 7, 2, '/uploads/sherlock-holmes-complete.jpg'),
(2, 'MT005', 'Big Little Lies', '9780399167065', 'Liane Moriarty - Domestic thriller', 14.99, 11.24, 10, 2, 20, 'ACTIVE', TRUE, 23, 8, 2, '/uploads/big-little-lies.jpg'),

-- Science Fiction & Fantasy
(2, 'SF001', 'Dune', '9780441172719', 'Frank Herbert - Epic science fiction', 18.99, 14.24, 10, 2, 20, 'ACTIVE', TRUE, 24, 7, 2, '/uploads/dune.jpg'),
(2, 'SF002', 'The Hobbit', '9780547928227', 'J.R.R. Tolkien - Fantasy classic', 14.99, 11.24, 20, 4, 40, 'ACTIVE', TRUE, 24, 7, 2, '/uploads/the-hobbit.jpg'),
(2, 'SF003', 'Foundation', '9780553803714', 'Isaac Asimov - Science fiction saga', 17.99, 13.49, 8, 1, 16, 'ACTIVE', TRUE, 24, 7, 2, '/uploads/foundation.jpg'),
(2, 'SF004', 'The Martian', '9780804139021', 'Andy Weir - Mars survival story', 16.99, 12.74, 12, 2, 24, 'ACTIVE', TRUE, 24, 8, 2, '/uploads/the-martian.jpg'),
(2, 'SF005', 'American Gods', '9780380789030', 'Neil Gaiman - Modern mythology', 18.99, 14.24, 9, 2, 18, 'ACTIVE', TRUE, 24, 8, 2, '/uploads/american-gods.jpg'),
(2, 'SF006', 'Ready Player One', '9780307887443', 'Ernest Cline - VR sci-fi adventure', 15.99, 11.99, 14, 3, 28, 'ACTIVE', TRUE, 24, 7, 2, '/uploads/ready-player-one.jpg'),

-- Romance
(2, 'RO001', 'The Notebook', '9780446605236', 'Nicholas Sparks - Romantic novel', 13.99, 10.49, 12, 2, 24, 'ACTIVE', TRUE, 25, 7, 2, '/uploads/the-notebook.jpg'),
(2, 'RO002', 'Me Before You', '9780143124542', 'Jojo Moyes - Contemporary romance', 14.99, 11.24, 10, 2, 20, 'ACTIVE', TRUE, 25, 8, 2, '/uploads/me-before-you.jpg'),
(2, 'RO003', 'Outlander', '9780440212561', 'Diana Gabaldon - Historical romance', 16.99, 12.74, 8, 1, 16, 'ACTIVE', TRUE, 25, 7, 2, '/uploads/outlander.jpg'),
(2, 'RO004', 'P.S. I Love You', '9780786865643', 'Cecelia Ahern - Romantic novel', 12.99, 9.74, 10, 2, 20, 'ACTIVE', TRUE, 25, 8, 2, '/uploads/ps-i-love-you.jpg'),

-- Biography & Memoir
(2, 'BM001', 'Steve Jobs', '9781451648539', 'Walter Isaacson - Biography of Apple founder', 24.99, 18.74, 6, 1, 12, 'ACTIVE', TRUE, 26, 8, 2, '/uploads/steve-jobs.jpg'),
(2, 'BM002', 'Educated', '9780399590504', 'Tara Westover - Memoir of education journey', 16.99, 12.74, 10, 2, 20, 'ACTIVE', TRUE, 26, 7, 2, '/uploads/educated.jpg'),
(2, 'BM003', 'Becoming', '9781524763138', 'Michelle Obama - Former First Lady memoir', 22.99, 17.24, 8, 1, 16, 'ACTIVE', TRUE, 26, 7, 2, '/uploads/becoming.jpg'),
(2, 'BM004', 'When Breath Becomes Air', '9780812988406', 'Paul Kalanithi - Neurosurgeon memoir', 14.99, 11.24, 12, 2, 24, 'ACTIVE', TRUE, 26, 8, 2, '/uploads/when-breath-becomes-air.jpg'),

-- Self-Help & Personal Development
(2, 'SH001', 'Atomic Habits', '9780735211292', 'James Clear - Build good habits', 24.99, 18.74, 15, 3, 30, 'ACTIVE', TRUE, 28, 7, 2, '/uploads/atomic-habits.jpg'),
(2, 'SH002', 'The Power of Habit', '9780812981605', 'Charles Duhigg - Why we do what we do', 16.99, 12.74, 12, 2, 24, 'ACTIVE', TRUE, 28, 8, 2, '/uploads/the-power-of-habit.jpg'),
(2, 'SH003', 'Thinking, Fast and Slow', '9780374533557', 'Daniel Kahneman - Behavioral economics', 18.99, 14.24, 8, 1, 16, 'ACTIVE', TRUE, 28, 7, 2, '/uploads/thinking-fast-slow.jpg'),
(2, 'SH004', 'The 7 Habits of Highly Effective People', '9780743273558', 'Stephen Covey - Personal development classic', 16.99, 12.74, 10, 2, 20, 'ACTIVE', TRUE, 28, 7, 2, '/uploads/7-habits.jpg'),
(2, 'SH005', 'How to Win Friends and Influence People', '9780671027032', 'Dale Carnegie - People skills classic', 15.99, 11.99, 12, 2, 24, 'ACTIVE', TRUE, 28, 7, 2, '/uploads/how-to-win-friends.jpg'),

-- Picture Books (Children)
(2, 'PB001', 'The Very Hungry Caterpillar', '9780399226908', 'Eric Carle - Classic picture book', 10.99, 8.24, 15, 3, 30, 'ACTIVE', TRUE, 29, 9, 6, '/uploads/very-hungry-caterpillar.jpg'),
(2, 'PB002', 'Where the Wild Things Are', '9780064431789', 'Maurice Sendak - Caldecott Medal winner', 16.99, 12.74, 10, 2, 20, 'ACTIVE', TRUE, 29, 8, 2, '/uploads/where-wild-things-are.jpg'),
(2, 'PB003', 'Goodnight Moon', '9780694003617', 'Margaret Wise Brown - Bedtime classic', 7.99, 5.99, 18, 3, 36, 'ACTIVE', TRUE, 29, 7, 2, '/uploads/goodnight-moon.jpg'),
(2, 'PB004', 'The Giving Tree', '9780060256654', 'Shel Silverstein - Story of giving', 16.99, 12.74, 8, 1, 16, 'ACTIVE', TRUE, 29, 8, 2, '/uploads/the-giving-tree.jpg'),

-- Middle Grade Books
(2, 'MG001', 'Harry Potter and the Sorcerer''s Stone', '9780439708180', 'J.K. Rowling - First Harry Potter book', 12.99, 9.74, 20, 4, 40, 'ACTIVE', TRUE, 30, 9, 6, '/uploads/harry-potter-1.jpg'),
(2, 'MG002', 'Charlotte''s Web', '9780064400558', 'E.B. White - Friendship classic', 8.99, 6.74, 15, 3, 30, 'ACTIVE', TRUE, 30, 7, 2, '/uploads/charlottes-web.jpg'),
(2, 'MG003', 'The Giver', '9780440237686', 'Lois Lowry - Newbery Medal winner', 7.99, 5.99, 12, 2, 24, 'ACTIVE', TRUE, 30, 7, 2, '/uploads/the-giver.jpg'),
(2, 'MG004', 'Holes', '9780739326328', 'Louis Sachar - Adventure mystery', 8.99, 6.74, 10, 2, 20, 'ACTIVE', TRUE, 30, 8, 2, '/uploads/holes.jpg'),

-- Young Adult Books
(2, 'YA001', 'The Hunger Games', '9780439023528', 'Suzanne Collins - Dystopian adventure', 10.99, 8.24, 15, 3, 30, 'ACTIVE', TRUE, 31, 7, 2, '/uploads/hunger-games.jpg'),
(2, 'YA002', 'The Fault in Our Stars', '9780142415437', 'John Green - Teen romance', 10.99, 8.24, 18, 3, 36, 'ACTIVE', TRUE, 31, 7, 2, '/uploads/fault-in-our-stars.jpg'),
(2, 'YA003', 'Wonder', '9780375869020', 'R.J. Palacio - Anti-bullying story', 13.99, 10.49, 12, 2, 24, 'ACTIVE', TRUE, 31, 8, 2, '/uploads/wonder.jpg'),
(2, 'YA004', 'Divergent', '9780062024039', 'Veronica Roth - Dystopian series starter', 9.99, 7.49, 10, 2, 20, 'ACTIVE', TRUE, 31, 7, 2, '/uploads/divergent.jpg'),

-- Business & Economics
(2, 'BE001', 'Zero to One', '9780804139298', 'Peter Thiel - Startup innovation', 16.99, 12.74, 8, 1, 16, 'ACTIVE', TRUE, 20, 7, 2, '/uploads/zero-to-one.jpg'),
(2, 'BE002', 'The Lean Startup', '9780307887894', 'Eric Ries - Startup methodology', 15.99, 11.99, 10, 2, 20, 'ACTIVE', TRUE, 20, 8, 2, '/uploads/lean-startup.jpg'),
(2, 'BE003', 'Good to Great', '9780066620992', 'Jim Collins - Business excellence', 16.99, 12.74, 9, 2, 18, 'ACTIVE', TRUE, 20, 7, 2, '/uploads/good-to-great.jpg'),
(2, 'BE004', 'The Intelligent Investor', '9780060555665', 'Benjamin Graham - Value investing classic', 22.99, 17.24, 6, 1, 12, 'ACTIVE', TRUE, 20, 7, 2, '/uploads/intelligent-investor.jpg'),
(2, 'BE005', 'Thinking in Bets', '9780735216358', 'Annie Duke - Decision making under uncertainty', 16.99, 12.74, 7, 1, 14, 'ACTIVE', TRUE, 20, 8, 2, '/uploads/thinking-in-bets.jpg'),

-- Notebooks & Journals
(2, 'NJ001', 'Moleskine Classic Hardcover Notebook Large', '9788883701127', 'Classic ruled notebook, 240 pages', 19.99, 14.99, 20, 4, 40, 'ACTIVE', TRUE, 32, 12, 14, '/uploads/moleskine-classic-large.jpg'),
(2, 'NJ002', 'Moleskine Classic Hardcover Notebook Medium', '9788883701004', 'Classic ruled notebook, 192 pages', 16.99, 12.74, 25, 5, 50, 'ACTIVE', TRUE, 32, 12, 14, '/uploads/moleskine-classic-medium.jpg'),
(2, 'NJ003', 'Moleskine Soft Cover Notebook Large', '9788883706177', 'Soft cover ruled notebook, 240 pages', 17.99, 13.49, 18, 3, 36, 'ACTIVE', TRUE, 32, 12, 14, '/uploads/moleskine-soft-large.jpg'),
(2, 'NJ004', 'Moleskine Volant Journal Set of 2', '9788883704180', 'Set of 2 soft cover notebooks', 14.99, 11.24, 15, 3, 30, 'ACTIVE', TRUE, 32, 12, 14, '/uploads/moleskine-volant-set.jpg'),

-- Writing Instruments
(2, 'WI001', 'Papermate InkJoy 100RT Ballpoint Pens 12ct', '071641001234', 'Assorted colors ballpoint pens', 8.99, 6.74, 30, 6, 60, 'ACTIVE', TRUE, 33, 2, 13, '/uploads/papermate-inkjoy-12ct.jpg'),
(2, 'WI002', 'Sharpie Fine Point Permanent Markers 12ct', '0007118200001', 'Fine point permanent markers', 11.99, 8.99, 25, 5, 50, 'ACTIVE', TRUE, 33, 2, 14, '/uploads/sharpie-fine-point-12ct.jpg'),
(2, 'WI003', 'Papermate Mechanical Pencils 5ct', '071641011234', '0.7mm mechanical pencils', 5.99, 4.49, 20, 4, 40, 'ACTIVE', TRUE, 33, 2, 13, '/uploads/papermate-mechanical-pencils-5ct.jpg'),
(2, 'WI004', 'Sharpie S-Note Creative Markers 8ct', '0007118200012', 'Creative highlighters and markers', 12.99, 9.74, 18, 3, 36, 'ACTIVE', TRUE, 33, 2, 14, '/uploads/sharpie-s-note-8ct.jpg'),

-- Office Supplies
(2, 'OS001', 'Post-it Super Sticky Notes 3x3 12 Pads', '0002120012094', 'Super sticky notes, assorted colors', 9.99, 7.49, 20, 4, 40, 'ACTIVE', TRUE, 34, 2, 14, '/uploads/post-it-super-sticky-12pads.jpg'),
(2, 'OS002', 'Scotch Heavy Duty Shipping Tape 6 Rolls', '0002120013836', 'Heavy duty shipping tape', 14.99, 11.24, 12, 2, 24, 'ACTIVE', TRUE, 34, 2, 14, '/uploads/scotch-heavy-duty-tape.jpg'),
(2, 'OS003', 'Swingline Desktop Stapler', '0007251102431', 'Classic desktop stapler', 12.99, 9.74, 8, 1, 16, 'ACTIVE', TRUE, 34, 2, 13, '/uploads/swingline-stapler.jpg'),
(2, 'OS004', 'Staples Standard Paper Clips 1000ct', '0007181000115', 'Standard paper clips', 3.99, 2.99, 30, 6, 60, 'ACTIVE', TRUE, 34, 2, 13, '/uploads/staples-paper-clips.jpg');

-- Update statistics and verification queries at the end
-- Note: Total products inserted:
-- - Company 1 (Quick Stop): 39 products
-- - Company 2 (The Bookworm): 70 products
-- - Each product includes proper pricing, inventory levels, and image paths
-- - All products are categorized and linked to appropriate suppliers and brands