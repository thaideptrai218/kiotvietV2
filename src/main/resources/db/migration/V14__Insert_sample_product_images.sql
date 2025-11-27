-- =============================================
-- V14__Insert_sample_product_images.sql
-- Purpose: Insert sample product images for both companies
-- Provides image metadata for all products inserted in V13
-- =============================================

-- ============= PRODUCT IMAGES FOR COMPANY 1 (Quick Stop Convenience Store) =============
INSERT IGNORE INTO product_images (product_id, company_id, image_url, alt_text, file_size, image_order, is_primary, created_at) VALUES
-- Soft Drinks
(1, 1, '/uploads/coca-cola-390ml.jpg', 'Coca-Cola lon 390ml can', 245760, 1, TRUE, CURRENT_TIMESTAMP),
(2, 1, '/uploads/coca-cola-zero-390ml.jpg', 'Coca-Cola Zero Sugar lon 390ml can', 248123, 1, TRUE, CURRENT_TIMESTAMP),
(3, 1, '/uploads/pepsi-390ml.jpg', 'Pepsi lon 390ml can', 242456, 1, TRUE, CURRENT_TIMESTAMP),
(4, 1, '/uploads/sprite-355ml.jpg', 'Sprite 355ml can', 236543, 1, TRUE, CURRENT_TIMESTAMP),
(5, 1, '/uploads/red-bull-250ml.jpg', 'Red Bull energy drink 250ml can', 224567, 1, TRUE, CURRENT_TIMESTAMP),

-- Water & Juices
(6, 1, '/uploads/dasani-500ml.jpg', 'Dasani purified water 500ml bottle', 198765, 1, TRUE, CURRENT_TIMESTAMP),
(7, 1, '/uploads/aquafina-500ml.jpg', 'Aquafina purified water 500ml bottle', 201234, 1, TRUE, CURRENT_TIMESTAMP),
(8, 1, '/uploads/minute-maid-oj-250ml.jpg', 'Minute Maid orange juice carton 250ml', 210543, 1, TRUE, CURRENT_TIMESTAMP),
(9, 1, '/uploads/apple-eve-aj-250ml.jpg', 'Apple & Eve apple juice carton 250ml', 198765, 1, TRUE, CURRENT_TIMESTAMP),

-- Tea & Coffee
(10, 1, '/uploads/lipton-black-tea-20ct.jpg', 'Lipton black tea bags 20 count box', 225432, 1, TRUE, CURRENT_TIMESTAMP),
(11, 1, '/uploads/green-tea-20ct.jpg', 'Green tea bags 20 count box', 223456, 1, TRUE, CURRENT_TIMESTAMP),
(12, 1, '/uploads/starbucks-via-coffee-8ct.jpg', 'Starbucks VIA instant coffee 8 count box', 265432, 1, TRUE, CURRENT_TIMESTAMP),
(13, 1, '/uploads/nescafe-classic-100g.jpg', 'Nescafé Classic instant coffee jar 100g', 245678, 1, TRUE, CURRENT_TIMESTAMP),

-- Energy Drinks
(14, 1, '/uploads/red-bull-250ml.jpg', 'Red Bull energy drink 250ml can', 224567, 1, TRUE, CURRENT_TIMESTAMP),
(15, 1, '/uploads/monster-energy-500ml.jpg', 'Monster Energy energy drink 500ml can', 298765, 1, TRUE, CURRENT_TIMESTAMP),
(16, 1, '/uploads/red-bull-sugarfree-250ml.jpg', 'Red Bull sugar-free 250ml can', 225432, 1, TRUE, CURRENT_TIMESTAMP),

-- Chips & Crackers
(17, 1, '/uploads/lays-classic-200g.jpg', 'Lay\'s Classic potato chips 200g bag', 245678, 1, TRUE, CURRENT_TIMESTAMP),
(18, 1, '/uploads/lays-bbq-200g.jpg', 'Lay\'s BBQ potato chips 200g bag', 248901, 1, TRUE, CURRENT_TIMESTAMP),
(19, 1, '/uploads/doritos-nacho-240g.jpg', 'Doritos Nacho Cheese flavored tortilla chips', 276543, 1, TRUE, CURRENT_TIMESTAMP),
(20, 1, '/uploads/doritos-cool-ranch-240g.jpg', 'Doritos Cool Ranch flavored tortilla chips', 274321, 1, TRUE, CURRENT_TIMESTAMP),
(21, 1, '/uploads/cheetos-crunchy-220g.jpg', 'Cheetos Crunchy cheese flavored snacks', 265432, 1, TRUE, CURRENT_TIMESTAMP),

-- Candy & Chocolate
(22, 1, '/uploads/oreo-original-433g.jpg', 'Oreo Original cookies 433g package', 287654, 1, TRUE, CURRENT_TIMESTAMP),
(23, 1, '/uploads/milky-way-51g.jpg', 'Milky Way chocolate bar 51g', 165432, 1, TRUE, CURRENT_TIMESTAMP),
(24, 1, '/uploads/snickers-52g.jpg', 'Snickers chocolate bar 52g', 167890, 1, TRUE, CURRENT_TIMESTAMP),
(25, 1, '/uploads/mms-milk-chocolate-47g.jpg', 'M&M\'s Milk Chocolate candies 47g', 143210, 1, TRUE, CURRENT_TIMESTAMP),

-- Instant Noodles
(26, 1, '/uploads/maruchan-chicken-85g.jpg', 'Maruchan chicken flavor instant ramen 85g', 123456, 1, TRUE, CURRENT_TIMESTAMP),
(27, 1, '/uploads/maruchan-beef-85g.jpg', 'Maruchan beef flavor instant ramen 85g', 124789, 1, TRUE, CURRENT_TIMESTAMP),
(28, 1, '/uploads/maruchan-shrimp-85g.jpg', 'Maruchan shrimp flavor instant ramen 85g', 125012, 1, TRUE, CURRENT_TIMESTAMP),

-- Laundry Supplies
(29, 1, '/uploads/tide-original-50oz.jpg', 'Tide Original Scent liquid detergent 50oz', 365432, 1, TRUE, CURRENT_TIMESTAMP),
(30, 1, '/uploads/tide-pods-42ct.jpg', 'Tide Pods laundry detergent pods 42 count', 456789, 1, TRUE, CURRENT_TIMESTAMP),
(31, 1, '/uploads/downy-120-loads.jpg', 'Downy fabric softener 120 loads', 378901, 1, TRUE, CURRENT_TIMESTAMP),

-- Dish Cleaning
(32, 1, '/uploads/dawn-ultra-24oz.jpg', 'Dawn Ultra concentrated dish soap 24oz', 234567, 1, TRUE, CURRENT_TIMESTAMP),
(33, 1, '/uploads/cascade-complete-75oz.jpg', 'Cascade Complete gel dishwasher detergent 75oz', 345678, 1, TRUE, CURRENT_TIMESTAMP),

-- Paper Products
(34, 1, '/uploads/bounty-select-a-size-12roll.jpg', 'Bounty Select-A-Size paper towels 12 roll pack', 456789, 1, TRUE, CURRENT_TIMESTAMP),
(35, 1, '/uploads/charmin-ultra-soft-12roll.jpg', 'Charmin Ultra Soft toilet paper 12 roll pack', 467890, 1, TRUE, CURRENT_TIMESTAMP),
(36, 1, '/uploads/kleenex-160ct.jpg', 'Kleenex facial tissues 160 count box', 198765, 1, TRUE, CURRENT_TIMESTAMP),

-- Personal Care
(37, 1, '/uploads/colgate-total-4.6oz.jpg', 'Colgate Total advanced health toothpaste 4.6oz', 156789, 1, TRUE, CURRENT_TIMESTAMP),
(38, 1, '/uploads/dove-beauty-bar-4ct.jpg', 'Dove Beauty Bar soap 4 count pack', 145678, 1, TRUE, CURRENT_TIMESTAMP),
(39, 1, '/uploads/degree-deodorant-2.7oz.jpg', 'Degree invisible solid deodorant 2.7oz', 154321, 1, TRUE, CURRENT_TIMESTAMP);

-- ============= PRODUCT IMAGES FOR COMPANY 2 (The Bookworm English Bookstore) =============
INSERT IGNORE INTO product_images (product_id, company_id, image_url, alt_text, file_size, image_order, is_primary, created_at) VALUES
-- Literary Fiction covers
(40, 2, '/uploads/to-kill-a-mockingbird.jpg', 'To Kill a Mockingbird book cover', 456789, 1, TRUE, CURRENT_TIMESTAMP),
(41, 2, '/uploads/1984.jpg', '1984 book cover', 423456, 1, TRUE, CURRENT_TIMESTAMP),
(42, 2, '/uploads/pride-and-prejudice.jpg', 'Pride and Prejudice book cover', 434567, 1, TRUE, CURRENT_TIMESTAMP),
(43, 2, '/uploads/the-great-gatsby.jpg', 'The Great Gatsby book cover', 445678, 1, TRUE, CURRENT_TIMESTAMP),
(44, 2, '/uploads/one-hundred-years.jpg', 'One Hundred Years of Solitude book cover', 467890, 1, TRUE, CURRENT_TIMESTAMP),
(45, 2, '/uploads/the-catcher-in-the-rye.jpg', 'The Catcher in the Rye book cover', 412345, 1, TRUE, CURRENT_TIMESTAMP),
(46, 2, '/uploads/lord-of-the-flies.jpg', 'Lord of the Flies book cover', 401234, 1, TRUE, CURRENT_TIMESTAMP),

-- Mystery & Thriller covers
(47, 2, '/uploads/girl-with-dragon-tattoo.jpg', 'The Girl with the Dragon Tattoo book cover', 478901, 1, TRUE, CURRENT_TIMESTAMP),
(48, 2, '/uploads/gone-girl.jpg', 'Gone Girl book cover', 489012, 1, TRUE, CURRENT_TIMESTAMP),
(49, 2, '/uploads/the-da-vinci-code.jpg', 'The Da Vinci Code book cover', 490123, 1, TRUE, CURRENT_TIMESTAMP),
(50, 2, '/uploads/sherlock-holmes-complete.jpg', 'Sherlock Holmes Complete Novels book cover', 654321, 1, TRUE, CURRENT_TIMESTAMP),
(51, 2, '/uploads/big-little-lies.jpg', 'Big Little Lies book cover', 423456, 1, TRUE, CURRENT_TIMESTAMP),

-- Science Fiction & Fantasy covers
(52, 2, '/uploads/dune.jpg', 'Dune book cover', 501234, 1, TRUE, CURRENT_TIMESTAMP),
(53, 2, '/uploads/the-hobbit.jpg', 'The Hobbit book cover', 412345, 1, TRUE, CURRENT_TIMESTAMP),
(54, 2, '/uploads/foundation.jpg', 'Foundation book cover', 523456, 1, TRUE, CURRENT_TIMESTAMP),
(55, 2, '/uploads/the-martian.jpg', 'The Martian book cover', 486789, 1, TRUE, CURRENT_TIMESTAMP),
(56, 2, '/uploads/american-gods.jpg', 'American Gods book cover', 497890, 1, TRUE, CURRENT_TIMESTAMP),
(57, 2, '/uploads/ready-player-one.jpg', 'Ready Player One book cover', 465432, 1, TRUE, CURRENT_TIMESTAMP),

-- Romance covers
(58, 2, '/uploads/the-notebook.jpg', 'The Notebook book cover', 378901, 1, TRUE, CURRENT_TIMESTAMP),
(59, 2, '/uploads/me-before-you.jpg', 'Me Before You book cover', 389012, 1, TRUE, CURRENT_TIMESTAMP),
(60, 2, '/uploads/outlander.jpg', 'Outlander book cover', 412345, 1, TRUE, CURRENT_TIMESTAMP),
(61, 2, '/uploads/ps-i-love-you.jpg', 'P.S. I Love You book cover', 334567, 1, TRUE, CURRENT_TIMESTAMP),

-- Biography & Memoir covers
(62, 2, '/uploads/steve-jobs.jpg', 'Steve Jobs biography cover', 567890, 1, TRUE, CURRENT_TIMESTAMP),
(63, 2, '/uploads/educated.jpg', 'Educated memoir cover', 523456, 1, TRUE, CURRENT_TIMESTAMP),
(64, 2, '/uploads/becoming.jpg', 'Becoming memoir cover', 578901, 1, TRUE, CURRENT_TIMESTAMP),
(65, 2, '/uploads/when-breath-becomes-air.jpg', 'When Breath Becomes Air memoir cover', 486789, 1, TRUE, CURRENT_TIMESTAMP),

-- Self-Help & Personal Development covers
(66, 2, '/uploads/atomic-habits.jpg', 'Atomic Habits book cover', 489012, 1, TRUE, CURRENT_TIMESTAMP),
(67, 2, '/uploads/the-power-of-habit.jpg', 'The Power of Habit book cover', 490123, 1, TRUE, CURRENT_TIMESTAMP),
(68, 2, '/uploads/thinking-fast-slow.jpg', 'Thinking, Fast and Slow book cover', 498765, 1, TRUE, CURRENT_TIMESTAMP),
(69, 2, '/uploads/7-habits.jpg', 'The 7 Habits of Highly Effective People book cover', 465432, 1, TRUE, CURRENT_TIMESTAMP),
(70, 2, '/uploads/how-to-win-friends.jpg', 'How to Win Friends and Influence People book cover', 434567, 1, TRUE, CURRENT_TIMESTAMP),

-- Picture Books (Children) covers
(71, 2, '/uploads/very-hungry-caterpillar.jpg', 'The Very Hungry Caterpillar cover', 345678, 1, TRUE, CURRENT_TIMESTAMP),
(72, 2, '/uploads/where-wild-things-are.jpg', 'Where the Wild Things Are cover', 356789, 1, TRUE, CURRENT_TIMESTAMP),
(73, 2, '/uploads/goodnight-moon.jpg', 'Goodnight Moon cover', 234567, 1, TRUE, CURRENT_TIMESTAMP),
(74, 2, '/uploads/the-giving-tree.jpg', 'The Giving Tree cover', 367890, 1, TRUE, CURRENT_TIMESTAMP),

-- Middle Grade Books covers
(75, 2, '/uploads/harry-potter-1.jpg', 'Harry Potter and the Sorcerer\'s Stone book cover', 423456, 1, TRUE, CURRENT_TIMESTAMP),
(76, 2, '/uploads/charlottes-web.jpg', 'Charlotte\'s Web book cover', 234567, 1, TRUE, CURRENT_TIMESTAMP),
(77, 2, '/uploads/the-giver.jpg', 'The Giver book cover', 223456, 1, TRUE, CURRENT_TIMESTAMP),
(78, 2, '/uploads/holes.jpg', 'Holes book cover', 212345, 1, TRUE, CURRENT_TIMESTAMP),

-- Young Adult Books covers
(79, 2, '/uploads/hunger-games.jpg', 'The Hunger Games book cover', 389012, 1, TRUE, CURRENT_TIMESTAMP),
(80, 2, '/uploads/fault-in-our-stars.jpg', 'The Fault in Our Stars book cover', 378901, 1, TRUE, CURRENT_TIMESTAMP),
(81, 2, '/uploads/wonder.jpg', 'Wonder book cover', 398765, 1, TRUE, CURRENT_TIMESTAMP),
(82, 2, '/uploads/divergent.jpg', 'Divergent book cover', 312456, 1, TRUE, CURRENT_TIMESTAMP),

-- Business & Economics covers
(83, 2, '/uploads/zero-to-one.jpg', 'Zero to One book cover', 456789, 1, TRUE, CURRENT_TIMESTAMP),
(84, 2, '/uploads/lean-startup.jpg', 'The Lean Startup book cover', 434567, 1, TRUE, CURRENT_TIMESTAMP),
(85, 2, '/uploads/good-to-great.jpg', 'Good to Great book cover', 445678, 1, TRUE, CURRENT_TIMESTAMP),
(86, 2, '/uploads/intelligent-investor.jpg', 'The Intelligent Investor book cover', 523456, 1, TRUE, CURRENT_TIMESTAMP),
(87, 2, '/uploads/thinking-in-bets.jpg', 'Thinking in Bets book cover', 434567, 1, TRUE, CURRENT_TIMESTAMP),

-- Notebooks & Journals covers
(88, 2, '/uploads/moleskine-classic-large.jpg', 'Moleskine Classic Large notebook', 345678, 1, TRUE, CURRENT_TIMESTAMP),
(89, 2, '/uploads/moleskine-classic-medium.jpg', 'Moleskine Classic Medium notebook', 334567, 1, TRUE, CURRENT_TIMESTAMP),
(90, 2, '/uploads/moleskine-soft-large.jpg', 'Moleskine Soft Cover Large notebook', 323456, 1, TRUE, CURRENT_TIMESTAMP),
(91, 2, '/uploads/moleskine-volant-set.jpg', 'Moleskine Volant Journal Set of 2', 298765, 1, TRUE, CURRENT_TIMESTAMP),

-- Writing Instruments covers
(92, 2, '/uploads/papermate-inkjoy-12ct.jpg', 'Papermate InkJoy 12 pen set', 234567, 1, TRUE, CURRENT_TIMESTAMP),
(93, 2, '/uploads/sharpie-fine-point-12ct.jpg', 'Sharpie Fine Point 12 marker set', 287654, 1, TRUE, CURRENT_TIMESTAMP),
(94, 2, '/uploads/papermate-mechanical-pencils-5ct.jpg', 'Papermate Mechanical Pencils 5 count', 187654, 1, TRUE, CURRENT_TIMESTAMP),
(95, 2, '/uploads/sharpie-s-note-8ct.jpg', 'Sharpie S-Note Creative Markers 8 count', 256789, 1, TRUE, CURRENT_TIMESTAMP),

-- Office Supplies covers
(96, 2, '/uploads/post-it-super-sticky-12pads.jpg', 'Post-it Super Sticky Notes 12 pad set', 312456, 1, TRUE, CURRENT_TIMESTAMP),
(97, 2, '/uploads/scotch-heavy-duty-tape.jpg', 'Scotch Heavy Duty Shipping Tape 6 pack', 356789, 1, TRUE, CURRENT_TIMESTAMP),
(98, 2, '/uploads/swingline-stapler.jpg', 'Swingline Desktop Stapler', 198765, 1, TRUE, CURRENT_TIMESTAMP),
(99, 2, '/uploads/staples-paper-clips.jpg', 'Staples Standard Paper Clips 1000 count', 156789, 1, TRUE, CURRENT_TIMESTAMP);

-- Update statistics and verification queries at the end
-- Note: Total product images inserted:
-- - Company 1 (Quick Stop): 39 product images
-- - Company 2 (The Bookworm): 60 product images
-- - Each image includes metadata (file size, alt text) for SEO and accessibility
-- - All images are marked as primary (is_primary = TRUE) for MVP simplicity
-- - Consistent image naming convention for easy management