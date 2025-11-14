-- =============================================
-- V9__Insert_company4_data.sql
-- Purpose: Insert English dataset for company 4 (bookstore)
-- =============================================

-- ============= CATEGORIES FOR COMPANY 4 =============
INSERT IGNORE INTO categories (id, company_id, name, description, path, parent_id, level, sort_order, is_active) VALUES
-- Main categories
(16, 4, 'Fiction', 'Fiction books and novels', '/fiction', NULL, 0, 1, TRUE),
(17, 4, 'Non-Fiction', 'Non-fiction books and biographies', '/non-fiction', NULL, 0, 2, TRUE),
(18, 4, 'Self-Help', 'Self-help and personal development', '/self-help', NULL, 0, 3, TRUE),
(19, 4, 'Children Books', 'Children books and young adult', '/children-books', NULL, 0, 4, TRUE),
(20, 4, 'Stationery', 'Office and school supplies', '/stationery', NULL, 0, 5, TRUE),
(21, 4, 'Gifts & Accessories', 'Book-related gifts and accessories', '/gifts', NULL, 0, 6, TRUE),
(22, 4, 'Academic', 'Textbooks and reference books', '/academic', NULL, 0, 7, TRUE),
(23, 4, 'Business & Economics', 'Business, finance, and economics', '/business', NULL, 0, 8, TRUE),
-- Sub-categories for Fiction
(24, 4, 'Literary Fiction', 'Literary fiction classics', '/fiction/literary', 16, 1, 1, TRUE),
(25, 4, 'Mystery & Thriller', 'Mystery, thriller, and suspense', '/fiction/mystery', 16, 2, 2, TRUE),
(26, 4, 'Science Fiction', 'Science fiction and fantasy', '/fiction/sci-fi', 16, 3, 3, TRUE),
(27, 4, 'Romance', 'Romance novels', '/fiction/romance', 16, 4, 4, TRUE),
-- Sub-categories for Non-Fiction
(28, 4, 'Biography', 'Biographies and memoirs', '/non-fiction/biography', 17, 1, 1, TRUE),
(29, 4, 'History', 'History books', '/non-fiction/history', 17, 2, 2, TRUE),
(30, 4, 'Science & Technology', 'Science and technology books', '/non-fiction/science', 17, 3, 3, TRUE),
-- Sub-categories for Children
(31, 4, 'Picture Books', 'Picture books for young children', '/children/picture-books', 19, 1, 1, TRUE),
(32, 4, 'Young Adult', 'Young adult fiction', '/children/young-adult', 19, 2, 2, TRUE),
(33, 4, 'Educational', 'Educational children books', '/children/educational', 19, 3, 3, TRUE);

-- ============= SUPPLIERS FOR COMPANY 4 =============
INSERT IGNORE INTO suppliers (id, company_id, name, contact_person, phone, email, address, tax_code, website, notes, outstanding_balance, credit_limit, is_active) VALUES
(9, 4, 'Penguin Random House', 'John Smith', '212-784-0500', 'sales@penguinrandomhouse.com', '1745 Broadway, New York, NY 10019', '13-1234567', 'https://www.penguinrandomhouse.com', 'Largest English book publisher', 45000000.00, 200000000.00, TRUE),
(10, 4, 'HarperCollins Publishers', 'Sarah Johnson', '212-207-7000', 'orders@harpercollins.com', '195 Broadway, New York, NY 10007', '13-2345678', 'https://www.harpercollins.com', 'Major book publisher', 38000000.00, 180000000.00, TRUE),
(11, 4, 'Simon & Schuster', 'Michael Davis', '212-632-4000', 'sales@simonandschuster.com', '1230 Avenue of the Americas, New York, NY 10020', '13-3456789', 'https://www.simonandschuster.com', 'Global publishing company', 42000000.00, 190000000.00, TRUE),
(12, 4, 'Hachette Book Group', 'Emily Wilson', '212-364-1100', 'orders@hbgusa.com', '1290 Avenue of the Americas, New York, NY 10104', '13-4567890', 'https://www.hachettebookgroup.com', 'International publisher', 35000000.00, 160000000.00, TRUE),
(13, 4, 'Scholastic Corporation', 'David Brown', '212-343-6100', 'school@scholastic.com', '557 Broadway, New York, NY 10012', '13-5678901', 'https://www.scholastic.com', 'Children books specialist', 28000000.00, 140000000.00, TRUE),
(14, 4, 'Amazon Books', 'Lisa Anderson', '206-266-1000', 'publisher-relations@amazon.com', '410 Terry Ave N, Seattle, WA 98109', '13-6789012', 'https://www.amazon.com', 'Online book retailer', 55000000.00, 250000000.00, TRUE),
(15, 4, 'Barnes & Noble', 'Robert Taylor', '212-633-3800', 'b2b@bn.com', '122 Fifth Avenue, New York, NY 10011', '13-7890123', 'https://www.barnesandnoble.com', 'Largest bookstore chain', 48000000.00, 220000000.00, TRUE),
(16, 4, 'Staples Office Supply', 'Jennifer Martinez', '800-333-3330', 'b2b@staples.com', '500 Staples Drive, Framingham, MA 01702', '13-8901234', 'https://www.staples.com', 'Office supplies retailer', 22000000.00, 100000000.00, TRUE);

-- ============= BRANDS FOR COMPANY 4 =============
INSERT IGNORE INTO brands (company_id, name, description, website) VALUES
(4, 'Penguin Classics', 'Classic literature imprint', 'https://www.penguin.co.uk/classics'),
(4, 'Vintage', 'Contemporary fiction imprint', 'https://www.vintage-books.co.uk'),
(4, 'Harper Perennial', 'Modern classics imprint', 'https://www.harperperennial.com'),
(4, 'Simon & Schuster', 'Simon & Schuster main imprint', 'https://www.simonandschuster.com'),
(4, 'Little, Brown and Company', 'Literary fiction imprint', 'https://www.littlebrown.com'),
(4, 'Scholastic', 'Children books publisher', 'https://www.scholastic.com'),
(4, 'Puffin Books', 'Children books imprint', 'https://www.puffin.co.uk'),
(4, 'Vintage International', 'International literature', 'https://www.vintageinternational.com'),
(4, 'Picador', 'Literary fiction imprint', 'https://www.picador.com'),
(4, 'Faber & Faber', 'Independent publisher', 'https://www.faber.co.uk'),
(4, 'Waterstones', 'UK bookstore chain', 'https://www.waterstones.com'),
(4, 'Moleskine', 'Premium notebooks', 'https://www.moleskine.com');

-- ============= PRODUCTS FOR COMPANY 4 =============
INSERT IGNORE INTO products (company_id, sku, name, barcode, description, selling_price, cost_price, on_hand, min_level, max_level, status, is_tracked, category_id, supplier_id, brand_id) VALUES
-- Literary Fiction
(4, 'FIC001', 'To Kill a Mockingbird', '9780061120084', 'Harper Lee - To Kill a Mockingbird', 24.99, 18.50, 75, 15, 150, 'ACTIVE', TRUE, 24, 10, 3),
(4, 'FIC002', '1984', '9780451524935', 'George Orwell - 1984', 22.99, 17.25, 80, 16, 160, 'ACTIVE', TRUE, 24, 9, 1),
(4, 'FIC003', 'Pride and Prejudice', '9780141439518', 'Jane Austen - Pride and Prejudice', 18.99, 14.25, 90, 18, 180, 'ACTIVE', TRUE, 24, 9, 1),
(4, 'FIC004', 'The Great Gatsby', '9780743273565', 'F. Scott Fitzgerald - The Great Gatsby', 19.99, 15.00, 85, 17, 170, 'ACTIVE', TRUE, 24, 9, 1),
(4, 'FIC005', 'One Hundred Years of Solitude', '9780060883287', 'Gabriel García Márquez - One Hundred Years of Solitude', 28.99, 21.75, 60, 12, 120, 'ACTIVE', TRUE, 24, 11, 5),
(4, 'FIC006', 'The Catcher in the Rye', '9780316769174', 'J.D. Salinger - The Catcher in the Rye', 21.99, 16.50, 70, 14, 140, 'ACTIVE', TRUE, 24, 10, 3),
(4, 'FIC007', 'Lord of the Flies', '9780571191475', 'William Golding - Lord of the Flies', 20.99, 15.75, 65, 13, 130, 'ACTIVE', TRUE, 24, 11, 5),
(4, 'FIC008', 'Brave New World', '9780060850524', 'Aldous Huxley - Brave New World', 23.99, 18.00, 55, 11, 110, 'ACTIVE', TRUE, 24, 9, 1),

-- Mystery & Thriller
(4, 'MYST001', 'The Girl with the Dragon Tattoo', '9780307949486', 'Stieg Larsson - The Girl with the Dragon Tattoo', 26.99, 20.25, 70, 14, 140, 'ACTIVE', TRUE, 25, 9, 1),
(4, 'MYST002', 'Gone Girl', '9780307588371', 'Gillian Flynn - Gone Girl', 24.99, 18.75, 80, 16, 160, 'ACTIVE', TRUE, 25, 10, 3),
(4, 'MYST003', 'The Da Vinci Code', '9780307474278', 'Dan Brown - The Da Vinci Code', 25.99, 19.50, 75, 15, 150, 'ACTIVE', TRUE, 25, 10, 3),
(4, 'MYST004', 'The Silence of the Lambs', '9780312924584', 'Thomas Harris - The Silence of the Lambs', 23.99, 18.00, 60, 12, 120, 'ACTIVE', TRUE, 25, 11, 5),
(4, 'MYST005', 'Sherlock Holmes: Complete Novels', '9780307277265', 'Arthur Conan Doyle - Sherlock Holmes Complete', 45.99, 34.50, 40, 8, 80, 'ACTIVE', TRUE, 25, 9, 1),
(4, 'MYST006', 'Big Little Lies', '9780399167065', 'Liane Moriarty - Big Little Lies', 22.99, 17.25, 85, 17, 170, 'ACTIVE', TRUE, 25, 11, 5),
(4, 'MYST007', 'The Girl on the Train', '9781594633669', 'Paula Hawkins - The Girl on the Train', 21.99, 16.50, 90, 18, 180, 'ACTIVE', TRUE, 25, 10, 3),
(4, 'MYST008', 'Rebecca', '9780316324242', 'Daphne du Maurier - Rebecca', 24.99, 18.75, 55, 11, 110, 'ACTIVE', TRUE, 25, 9, 1),

-- Science Fiction & Fantasy
(4, 'SF001', 'Dune', '9780441172719', 'Frank Herbert - Dune', 27.99, 21.00, 65, 13, 130, 'ACTIVE', TRUE, 26, 9, 1),
(4, 'SF002', 'The Hobbit', '9780547928227', 'J.R.R. Tolkien - The Hobbit', 22.99, 17.25, 100, 20, 200, 'ACTIVE', TRUE, 26, 9, 1),
(4, 'SF003', 'Foundation', '9780553803714', 'Isaac Asimov - Foundation', 26.99, 20.25, 50, 10, 100, 'ACTIVE', TRUE, 26, 10, 3),
(4, 'SF004', 'The Martian', '9780804139021', 'Andy Weir - The Martian', 24.99, 18.75, 75, 15, 150, 'ACTIVE', TRUE, 26, 11, 5),
(4, 'SF005', 'Neuromancer', '9780441569595', 'William Gibson - Neuromancer', 23.99, 18.00, 45, 9, 90, 'ACTIVE', TRUE, 26, 11, 5),
(4, 'SF006', 'American Gods', '9780380789030', 'Neil Gaiman - American Gods', 25.99, 19.50, 60, 12, 120, 'ACTIVE', TRUE, 26, 11, 5),
(4, 'SF007', 'Ready Player One', '9780307887443', 'Ernest Cline - Ready Player One', 21.99, 16.50, 80, 16, 160, 'ACTIVE', TRUE, 26, 10, 3),
(4, 'SF008', 'The Time Traveler''s Wife', '9780156029438', 'Audrey Niffenegger - The Time Traveler''s Wife', 23.99, 18.00, 55, 11, 110, 'ACTIVE', TRUE, 26, 11, 5),

-- Romance
(4, 'ROM001', 'The Notebook', '9780446605236', 'Nicholas Sparks - The Notebook', 22.99, 17.25, 85, 17, 170, 'ACTIVE', TRUE, 27, 10, 3),
(4, 'ROM002', 'Me Before You', '9780143124542', 'Jojo Moyes - Me Before You', 24.99, 18.75, 70, 14, 140, 'ACTIVE', TRUE, 27, 11, 5),
(4, 'ROM003', 'Outlander', '9780440212561', 'Diana Gabaldon - Outlander', 28.99, 21.75, 60, 12, 120, 'ACTIVE', TRUE, 27, 10, 3),
(4, 'ROM004', 'P.S. I Love You', '9780786865643', 'Cecelia Ahern - P.S. I Love You', 21.99, 16.50, 75, 15, 150, 'ACTIVE', TRUE, 27, 11, 5),

-- Biography & Memoir
(4, 'BIO001', 'Steve Jobs', '9781451648539', 'Walter Isaacson - Steve Jobs', 35.99, 27.00, 45, 9, 90, 'ACTIVE', TRUE, 28, 11, 5),
(4, 'BIO002', 'Educated', '9780399590504', 'Tara Westover - Educated', 28.99, 21.75, 60, 12, 120, 'ACTIVE', TRUE, 28, 10, 3),
(4, 'BIO003', 'Becoming', '9781524763138', 'Michelle Obama - Becoming', 32.99, 24.75, 50, 10, 100, 'ACTIVE', TRUE, 28, 9, 1),
(4, 'BIO004', 'When Breath Becomes Air', '9780812988406', 'Paul Kalanithi - When Breath Becomes Air', 24.99, 18.75, 70, 14, 140, 'ACTIVE', TRUE, 28, 11, 5),
(4, 'BIO005', 'The Diary of a Young Girl', '9780553296983', 'Anne Frank - The Diary of a Young Girl', 19.99, 15.00, 80, 16, 160, 'ACTIVE', TRUE, 28, 9, 1),

-- Self-Help & Personal Development
(4, 'SELF001', 'Atomic Habits', '9780735211292', 'James Clear - Atomic Habits', 27.99, 21.00, 90, 18, 180, 'ACTIVE', TRUE, 18, 10, 3),
(4, 'SELF002', 'The Power of Habit', '9780812981605', 'Charles Duhigg - The Power of Habit', 26.99, 20.25, 75, 15, 150, 'ACTIVE', TRUE, 18, 11, 5),
(4, 'SELF003', 'Thinking, Fast and Slow', '9780374533557', 'Daniel Kahneman - Thinking, Fast and Slow', 32.99, 24.75, 55, 11, 110, 'ACTIVE', TRUE, 18, 9, 1),
(4, 'SELF004', 'The 7 Habits of Highly Effective People', '9780743273558', 'Stephen Covey - The 7 Habits of Highly Effective People', 29.99, 22.50, 65, 13, 130, 'ACTIVE', TRUE, 18, 10, 3),
(4, 'SELF005', 'How to Win Friends and Influence People', '9780671027032', 'Dale Carnegie - How to Win Friends and Influence People', 24.99, 18.75, 80, 16, 160, 'ACTIVE', TRUE, 18, 10, 3),
(4, 'SELF006', 'Mindset', '9780345472328', 'Carol S. Dweck - Mindset', 23.99, 18.00, 70, 14, 140, 'ACTIVE', TRUE, 18, 11, 5),
(4, 'SELF007', 'The Subtle Art of Not Giving a F*ck', '9780062457714', 'Mark Manson - The Subtle Art of Not Giving a F*ck', 25.99, 19.50, 85, 17, 170, 'ACTIVE', TRUE, 18, 11, 5),
(4, 'SELF008', 'Deep Work', '9781455586691', 'Cal Newport - Deep Work', 26.99, 20.25, 60, 12, 120, 'ACTIVE', TRUE, 18, 10, 3),

-- Business & Economics
(4, 'BUS001', 'Zero to One', '9780804139298', 'Peter Thiel - Zero to One', 28.99, 21.75, 50, 10, 100, 'ACTIVE', TRUE, 23, 10, 3),
(4, 'BUS002', 'The Lean Startup', '9780307887894', 'Eric Ries - The Lean Startup', 27.99, 21.00, 65, 13, 130, 'ACTIVE', TRUE, 23, 11, 5),
(4, 'BUS003', 'Good to Great', '9780066620992', 'Jim Collins - Good to Great', 29.99, 22.50, 55, 11, 110, 'ACTIVE', TRUE, 23, 10, 3),
(4, 'BUS004', 'The Intelligent Investor', '9780060555665', 'Benjamin Graham - The Intelligent Investor', 35.99, 27.00, 40, 8, 80, 'ACTIVE', TRUE, 23, 9, 1),
(4, 'BUS005', 'Thinking in Bets', '9780735216358', 'Annie Duke - Thinking in Bets', 26.99, 20.25, 45, 9, 90, 'ACTIVE', TRUE, 23, 11, 5),
(4, 'BUS006', 'The 4-Hour Workweek', '9780307465351', 'Tim Ferriss - The 4-Hour Workweek', 24.99, 18.75, 70, 14, 140, 'ACTIVE', TRUE, 23, 10, 3),
(4, 'BUS007', 'Crushing It!', '9780062674678', 'Gary Vaynerchuk - Crushing It!', 25.99, 19.50, 75, 15, 150, 'ACTIVE', TRUE, 23, 11, 5),
(4, 'BUS008', 'Superintelligence', '9780199678112', 'Nick Bostrom - Superintelligence', 34.99, 26.25, 35, 7, 70, 'ACTIVE', TRUE, 23, 9, 1),

-- Children Books
(4, 'CHILD001', 'Harry Potter and the Sorcerer''s Stone', '9780439708180', 'J.K. Rowling - Harry Potter Book 1', 24.99, 18.75, 100, 20, 200, 'ACTIVE', TRUE, 32, 13, 7),
(4, 'CHILD002', 'The Very Hungry Caterpillar', '9780399226908', 'Eric Carle - The Very Hungry Caterpillar', 18.99, 14.25, 120, 24, 240, 'ACTIVE', TRUE, 31, 13, 7),
(4, 'CHILD003', 'Where the Wild Things Are', '9780064431789', 'Maurice Sendak - Where the Wild Things Are', 16.99, 12.75, 110, 22, 220, 'ACTIVE', TRUE, 31, 13, 7),
(4, 'CHILD004', 'The Hunger Games', '9780439023528', 'Suzanne Collins - The Hunger Games', 22.99, 17.25, 90, 18, 180, 'ACTIVE', TRUE, 32, 10, 3),
(4, 'CHILD005', 'The Fault in Our Stars', '9780142415437', 'John Green - The Fault in Our Stars', 21.99, 16.50, 85, 17, 170, 'ACTIVE', TRUE, 32, 10, 3),
(4, 'CHILD006', 'Wonder', '9780375869020', 'R.J. Palacio - Wonder', 19.99, 15.00, 95, 19, 190, 'ACTIVE', TRUE, 32, 11, 5),
(4, 'CHILD007', 'The Giver', '9780440237686', 'Lois Lowry - The Giver', 17.99, 13.50, 80, 16, 160, 'ACTIVE', TRUE, 32, 9, 1),
(4, 'CHILD008', 'Charlotte''s Web', '9780064400558', 'E.B. White - Charlotte''s Web', 16.99, 12.75, 105, 21, 210, 'ACTIVE', TRUE, 31, 9, 1),

-- Stationery
(4, 'STAT001', 'Moleskine Classic Notebook', '9788867322299', 'Moleskine Classic Hardcover Notebook Large', 34.99, 26.25, 60, 12, 120, 'ACTIVE', TRUE, 20, 16, 12),
(4, 'STAT002', 'Sharpie Permanent Markers', '0047018226239', 'Sharpie Fine Point Permanent Markers (12 count)', 14.99, 11.25, 150, 30, 300, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT003', 'Post-it Super Sticky Notes', '0002120012038', 'Post-it Super Sticky Notes 3x3 inches (12 pads)', 19.99, 15.00, 100, 20, 200, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT004', 'BIC Ballpoint Pens', '0070253026439', 'BIC Round Stic Ballpoint Pens (60 count)', 24.99, 18.75, 120, 24, 240, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT005', 'Scotch Tape Dispenser', '0002120013836', 'Scotch Heavy Duty Shipping Tape with Dispenser', 12.99, 9.75, 180, 36, 360, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT006', 'Mead Composition Notebook', '0044006071171', 'Mead Composition Notebook 100 pages', 4.99, 3.75, 200, 40, 400, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT007', 'Paper Mate Mechanical Pencils', '0007023438910', 'Paper Mate Clearpoint Mechanical Pencils (5 count)', 8.99, 6.75, 160, 32, 320, 'ACTIVE', TRUE, 20, 16, 11),
(4, 'STAT008', 'AmazonBasics Stapler', '0841661162756', 'AmazonBasics Heavy Duty Stapler', 16.99, 12.75, 80, 16, 160, 'ACTIVE', TRUE, 20, 16, 11);

-- ============= PRODUCT IMAGES FOR COMPANY 4 =============
INSERT IGNORE INTO product_images (product_id, company_id, image_url, alt_text, file_size, image_order, is_primary) VALUES
-- Literary Fiction covers
(37, 4, '/uploads/products/to-kill-a-mockingbird.jpg', 'To Kill a Mockingbird cover', 285672, 1, TRUE),
(38, 4, '/uploads/products/1984-cover.jpg', '1984 book cover', 274581, 1, TRUE),
(39, 4, '/uploads/products/pride-and-prejudice.jpg', 'Pride and Prejudice cover', 296723, 1, TRUE),
(40, 4, '/uploads/products/great-gatsby.jpg', 'The Great Gatsby cover', 267452, 1, TRUE),
(41, 4, '/uploads/products/one-hundred-years.jpg', 'One Hundred Years of Solitude cover', 312456, 1, TRUE),
-- Mystery covers
(42, 4, '/uploads/products/girl-with-dragon-tattoo.jpg', 'The Girl with the Dragon Tattoo cover', 289634, 1, TRUE),
(43, 4, '/uploads/products/gone-girl.jpg', 'Gone Girl book cover', 276543, 1, TRUE),
(44, 4, '/uploads/products/da-vinci-code.jpg', 'The Da Vinci Code cover', 298432, 1, TRUE),
(45, 4, '/uploads/products/silence-of-the-lambs.jpg', 'The Silence of the Lambs cover', 287321, 1, TRUE),
-- Science Fiction covers
(46, 4, '/uploads/products/dune-cover.jpg', 'Dune book cover', 305432, 1, TRUE),
(47, 4, '/uploads/products/the-hobbit.jpg', 'The Hobbit cover', 287654, 1, TRUE),
(48, 4, '/uploads/products/foundation-asimov.jpg', 'Foundation by Isaac Asimov', 298765, 1, TRUE),
(49, 4, '/uploads/products/the-martian.jpg', 'The Martian book cover', 286543, 1, TRUE),
-- Self-Help covers
(50, 4, '/uploads/products/atomic-habits.jpg', 'Atomic Habits book cover', 276543, 1, TRUE),
(51, 4, '/uploads/products/power-of-habit.jpg', 'The Power of Habit cover', 287654, 1, TRUE),
(52, 4, '/uploads/products/thinking-fast-slow.jpg', 'Thinking, Fast and Slow cover', 298765, 1, TRUE),
(53, 4, '/uploads/products/7-habits.jpg', '7 Habits of Highly Effective People', 265432, 1, TRUE),
-- Business covers
(54, 4, '/uploads/products/zero-to-one.jpg', 'Zero to One book cover', 276543, 1, TRUE),
(55, 4, '/uploads/products/lean-startup.jpg', 'The Lean Startup cover', 287654, 1, TRUE),
(56, 4, '/uploads/products/good-to-great.jpg', 'Good to Great book cover', 298765, 1, TRUE),
(57, 4, '/uploads/products/intelligent-investor.jpg', 'The Intelligent Investor cover', 309876, 1, TRUE),
-- Children books covers
(58, 4, '/uploads/products/harry-potter-1.jpg', 'Harry Potter and the Sorcerer''s Stone', 265432, 1, TRUE),
(59, 4, '/uploads/products/very-hungry-caterpillar.jpg', 'The Very Hungry Caterpillar', 254321, 1, TRUE),
(60, 4, '/uploads/products/where-wild-things.jpg', 'Where the Wild Things Are', 243210, 1, TRUE),
(61, 4, '/uploads/products/hunger-games.jpg', 'The Hunger Games book cover', 276543, 1, TRUE),
-- Stationery products
(62, 4, '/uploads/products/moleskine-notebook.jpg', 'Moleskine Classic Notebook', 187654, 1, TRUE),
(63, 4, '/uploads/products/sharpie-markers.jpg', 'Sharpie Permanent Markers', 176543, 1, TRUE),
(64, 4, '/uploads/products/post-it-notes.jpg', 'Post-it Super Sticky Notes', 165432, 1, TRUE),
(65, 4, '/uploads/products/bic-pens.jpg', 'BIC Ballpoint Pens', 154321, 1, TRUE),
(66, 4, '/uploads/products/stapler.jpg', 'AmazonBasics Stapler', 143210, 1, TRUE);