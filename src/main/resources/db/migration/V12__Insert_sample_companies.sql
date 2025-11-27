-- =============================================
-- V12__Insert_sample_companies.sql
-- Purpose: Insert comprehensive sample data for 2 different companies
-- Company 1: Quick Stop Convenience Store (American)
-- Company 2: The Bookworm English Bookstore (British)
-- =============================================

-- ============= COMPANIES =============
INSERT IGNORE INTO
    companies (
        id,
        name,
        email,
        phone,
        address,
        tax_code,
        country,
        country_flag,
        province,
        is_active
    )
VALUES
    -- Company 1: Quick Stop Convenience Store (American)
    (
        1,
        'Quick Stop Convenience Store',
        'contact@quickstop.com',
        '+1 212-555-0123',
        '123 Main Street, New York, NY',
        'US123456789',
        'United States',
        '🇺🇸',
        'New York',
        TRUE
    ),

-- Company 2: The Bookworm English Bookstore (British)
(
    2,
    'The Bookworm English Bookstore',
    'info@thebookworm.co.uk',
    '+44 20 7123 4567',
    '456 Oxford Street, London',
    'UK123456789',
    'United Kingdom',
    '🇬🇧',
    'England',
    TRUE
);

-- ============= BRANCHES =============
INSERT IGNORE INTO
    branches (
        id,
        company_id,
        name,
        code,
        address,
        phone,
        email,
        is_active
    )
VALUES
    -- Branches for Company 1 (Quick Stop)
    (
        1,
        1,
        'Downtown Store',
        'QS001',
        '123 Main Street, New York, NY',
        '+1 212-555-0123',
        'downtown@quickstop.com',
        TRUE
    ),
    (
        2,
        1,
        'Midtown Store',
        'QS002',
        '789 5th Avenue, New York, NY',
        '+1 212-555-0124',
        'midtown@quickstop.com',
        TRUE
    ),

-- Branches for Company 2 (The Bookworm)
(
    3,
    2,
    'Oxford Street Store',
    'BW001',
    '456 Oxford Street, London',
    '+44 20 7123 4567',
    'oxford@thebookworm.co.uk',
    TRUE
),
(
    4,
    2,
    'Covent Garden Store',
    'BW002',
    '321 Covent Garden, London',
    '+44 20 7123 4568',
    'covent@thebookworm.co.uk',
    TRUE
);

-- ============= USERS =============
INSERT IGNORE INTO
    user_info (
        id,
        company_id,
        username,
        email,
        full_name,
        phone,
        role,
        birthday,
        address,
        note,
        is_active
    )
VALUES
    -- Admin users
    (
        1,
        1,
        'admin_quickstop',
        'admin@quickstop.com',
        'John Anderson',
        '+1 212-555-0123',
        'admin',
        '1985-03-15',
        '456 Park Avenue, New York, NY',
        'Store owner and manager',
        TRUE
    ),
    (
        2,
        2,
        'admin_bookworm',
        'admin@thebookworm.co.uk',
        'Sarah Thompson',
        '+44 20 7123 4567',
        'admin',
        '1978-11-22',
        '789 Baker Street, London',
        'Bookstore owner and manager',
        TRUE
    ),

-- Manager users
(
    3,
    1,
    'manager_quickstop',
    'manager@quickstop.com',
    'Mike Johnson',
    '+1 212-555-0124',
    'manager',
    '1982-07-08',
    '321 Madison Avenue, New York, NY',
    'Downtown store manager',
    TRUE
),
(
    4,
    2,
    'manager_bookworm',
    'manager@thebookworm.co.uk',
    'Emma Wilson',
    '+44 20 7123 4568',
    'manager',
    '1980-09-17',
    '654 Abbey Road, London',
    'Covent Garden store manager',
    TRUE
),

-- Staff users
(
    5,
    1,
    'cashier1_quickstop',
    'cashier1@quickstop.com',
    'David Brown',
    '+1 212-555-0125',
    'user',
    '1990-04-25',
    '987 Broadway, New York, NY',
    'Full-time cashier',
    TRUE
),
(
    6,
    1,
    'cashier2_quickstop',
    'cashier2@quickstop.com',
    'Lisa Davis',
    '+1 212-555-0126',
    'user',
    '1993-12-10',
    '654 Times Square, New York, NY',
    'Part-time cashier',
    TRUE
),
(
    7,
    2,
    'bookseller1_bookworm',
    'bookseller1@thebookworm.co.uk',
    'Robert Miller',
    '+44 20 7123 4569',
    'user',
    '1988-06-30',
    '456 Camden High Street, London',
    'Senior bookseller',
    TRUE
),
(
    8,
    2,
    'bookseller2_bookworm',
    'bookseller2@thebookworm.co.uk',
    'Jennifer Taylor',
    '+44 20 7123 4570',
    'user',
    '1992-02-14',
    '789 Notting Hill Gate, London',
    'Junior bookseller',
    TRUE
);

-- ============= USER AUTH =============
-- Password: admin123 (hashed with BCrypt)
INSERT IGNORE INTO
    user_auth (
        user_info_id,
        password_hash,
        salt,
        two_factor_enabled
    )
VALUES (
        1,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        2,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        3,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        4,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        5,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        6,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        7,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    ),
    (
        8,
        '$2a$10$WAacCnmJBgxPBhNua2CPr.PHvb6OcFhIlI6z5g9kC1qqmbIV6Txdi',
        '4De7AH6dubOTmTOkISE6gw==',
        FALSE
    );

-- ============= CATEGORIES =============
INSERT IGNORE INTO
    categories (
        id,
        company_id,
        name,
        description,
        path,
        parent_id,
        level,
        sort_order,
        color,
        icon,
        is_active
    )
VALUES
    -- Company 1 Categories (Quick Stop Convenience Store)
    -- Main categories
    (
        1,
        1,
        'Beverages',
        'All types of drinks and beverages',
        '/beverages',
        NULL,
        0,
        1,
        '#4CAF50',
        '🥤',
        TRUE
    ),
    (
        2,
        1,
        'Snacks & Food',
        'Snacks, chips, candy, and food items',
        '/snacks-food',
        NULL,
        0,
        2,
        '#FF9800',
        '🍿',
        TRUE
    ),
    (
        3,
        1,
        'Household & Cleaning',
        'Cleaning supplies and household items',
        '/household',
        NULL,
        0,
        3,
        '#2196F3',
        '🧹',
        TRUE
    ),
    (
        4,
        1,
        'Personal Care',
        'Personal hygiene and health items',
        '/personal-care',
        NULL,
        0,
        4,
        '#9C27B0',
        '🧴',
        TRUE
    ),
    (
        5,
        1,
        'Tobacco & Vaping',
        'Cigarettes, cigars, and vaping products',
        '/tobacco',
        NULL,
        0,
        5,
        '#795548',
        '🚬',
        TRUE
    ),

-- Sub-categories for Beverages
(
    6,
    1,
    'Soft Drinks',
    'Carbonated soft drinks and sodas',
    '/beverages/soft-drinks',
    1,
    1,
    1,
    '#F44336',
    '🥤',
    TRUE
),
(
    7,
    1,
    'Tea & Coffee',
    'Tea bags, instant coffee, and beverages',
    '/beverages/tea-coffee',
    1,
    2,
    2,
    '#795548',
    '☕',
    TRUE
),
(
    8,
    1,
    'Energy Drinks',
    'Energy and sports drinks',
    '/beverages/energy-drinks',
    1,
    3,
    3,
    '#FF5722',
    '⚡',
    TRUE
),
(
    9,
    1,
    'Water & Juices',
    'Bottled water and fruit juices',
    '/beverages/water-juices',
    1,
    4,
    4,
    '#00BCD4',
    '💧',
    TRUE
),

-- Sub-categories for Snacks & Food
(
    10,
    1,
    'Chips & Crackers',
    'Potato chips and crackers',
    '/snacks-food/chips-crackers',
    2,
    1,
    1,
    '#FFC107',
    '🥔',
    TRUE
),
(
    11,
    1,
    'Candy & Chocolate',
    'Candy bars, chocolates, and sweets',
    '/snacks-food/candy-chocolate',
    2,
    2,
    2,
    '#E91E63',
    '🍫',
    TRUE
),
(
    12,
    1,
    'Cookies & Biscuits',
    'Cookies, biscuits, and baked goods',
    '/snacks-food/cookies-biscuits',
    2,
    3,
    3,
    '#8D6E63',
    '🍪',
    TRUE
),
(
    13,
    1,
    'Instant Noodles',
    'Cup noodles and instant meals',
    '/snacks-food/instant-noodles',
    2,
    4,
    4,
    '#FF6F00',
    '🍜',
    TRUE
),

-- Sub-categories for Household & Cleaning
(
    14,
    1,
    'Laundry Supplies',
    'Laundry detergent and supplies',
    '/household/laundry',
    3,
    1,
    1,
    '#03A9F4',
    '🧺',
    TRUE
),
(
    15,
    1,
    'Dish Cleaning',
    'Dish soap and cleaning supplies',
    '/household/dish-cleaning',
    3,
    2,
    2,
    '#009688',
    '🧽',
    TRUE
),
(
    16,
    1,
    'Paper Products',
    'Paper towels, tissues, and toilet paper',
    '/household/paper-products',
    3,
    3,
    3,
    '#AED581',
    '🧻',
    TRUE
),

-- Company 2 Categories (The Bookworm English Bookstore)
-- Main categories
(
    17,
    2,
    'Fiction',
    'Fiction books and novels',
    '/fiction',
    NULL,
    0,
    1,
    '#E53935',
    '📚',
    TRUE
),
(
    18,
    2,
    'Non-Fiction',
    'Non-fiction books and biographies',
    '/non-fiction',
    NULL,
    0,
    2,
    '#43A047',
    '📖',
    TRUE
),
(
    19,
    2,
    'Children & Young Adult',
    'Children books and young adult literature',
    '/children-ya',
    NULL,
    0,
    3,
    '#1E88E5',
    '🧸',
    TRUE
),
(
    20,
    2,
    'Business & Economics',
    'Business, finance, and economics books',
    '/business',
    NULL,
    0,
    4,
    '#FB8C00',
    '💼',
    TRUE
),
(
    21,
    2,
    'Stationery & Gifts',
    'Stationery items and book-related gifts',
    '/stationery',
    NULL,
    0,
    5,
    '#8E24AA',
    '🎁',
    TRUE
),

-- Sub-categories for Fiction
(
    22,
    2,
    'Literary Fiction',
    'Literary fiction classics',
    '/fiction/literary',
    17,
    1,
    1,
    '#C62828',
    '📜',
    TRUE
),
(
    23,
    2,
    'Mystery & Thriller',
    'Mystery, thriller, and suspense',
    '/fiction/mystery',
    17,
    2,
    2,
    '#AD1457',
    '🔍',
    TRUE
),
(
    24,
    2,
    'Science Fiction & Fantasy',
    'Science fiction and fantasy',
    '/fiction/sci-fi-fantasy',
    17,
    3,
    3,
    '#4527A0',
    '🚀',
    TRUE
),
(
    25,
    2,
    'Romance',
    'Romance novels',
    '/fiction/romance',
    17,
    4,
    4,
    '#D81B60',
    '💕',
    TRUE
),

-- Sub-categories for Non-Fiction
(
    26,
    2,
    'Biography & Memoir',
    'Biographies and memoirs',
    '/non-fiction/biography',
    18,
    1,
    1,
    '#2E7D32',
    '👤',
    TRUE
),
(
    27,
    2,
    'History',
    'History books',
    '/non-fiction/history',
    18,
    2,
    2,
    '#1565C0',
    '📅',
    TRUE
),
(
    28,
    2,
    'Self-Help & Personal Development',
    'Self-help and personal development',
    '/non-fiction/self-help',
    18,
    3,
    3,
    '#EF6C00',
    '🎯',
    TRUE
),

-- Sub-categories for Children & Young Adult
(
    29,
    2,
    'Picture Books',
    'Picture books for young children',
    '/children-ya/picture-books',
    19,
    1,
    1,
    '#00838F',
    '🎨',
    TRUE
),
(
    30,
    2,
    'Middle Grade',
    'Books for middle grade readers',
    '/children-ya/middle-grade',
    19,
    2,
    2,
    '#6A1B9A',
    '📕',
    TRUE
),
(
    31,
    2,
    'Young Adult',
    'Young adult fiction',
    '/children-ya/young-adult',
    19,
    3,
    3,
    '#00695C',
    '📘',
    TRUE
),

-- Sub-categories for Stationery & Gifts
(
    32,
    2,
    'Notebooks & Journals',
    'Notebooks, journals, and planners',
    '/stationery/notebooks',
    21,
    1,
    1,
    '#455A64',
    '📓',
    TRUE
),
(
    33,
    2,
    'Writing Instruments',
    'Pens, pencils, and markers',
    '/stationery/writing',
    21,
    2,
    2,
    '#5D4037',
    '✏️',
    TRUE
),
(
    34,
    2,
    'Office Supplies',
    'General office supplies',
    '/stationery/office',
    21,
    3,
    3,
    '#37474F',
    '📎',
    TRUE
);

-- ============= SUPPLIERS =============
INSERT IGNORE INTO
    suppliers (
        id,
        company_id,
        name,
        contact_person,
        phone,
        email,
        address,
        tax_code,
        website,
        notes,
        outstanding_balance,
        credit_limit,
        is_active
    )
VALUES
    -- Company 1 Suppliers (Quick Stop)
    (
        1,
        1,
        'Coca-Cola North America',
        'John Smith',
        '+1 404-676-2121',
        'orders@cocacola.com',
        '1 Coca-Cola Plaza, Atlanta, GA 30313',
        'US330123456',
        'https://www.coca-colacompany.com',
        'Primary beverage supplier',
        15000.00,
        50000.00,
        TRUE
    ),
    (
        2,
        1,
        'PepsiCo Beverages North America',
        'Sarah Johnson',
        '+1 914-253-2000',
        'orders@pepsico.com',
        '700 Anderson Hill Road, Purchase, NY 10577',
        'US133456789',
        'https://www.pepsico.com',
        'Alternative beverage supplier',
        8500.00,
        30000.00,
        TRUE
    ),
    (
        3,
        1,
        'Nestlé Waters North America',
        'Mike Davis',
        '+1 800-527-7456',
        'orders@nestlewatersna.com',
        '1001 Vista Way, Stamford, CT 06907',
        'US060987654',
        'https://www.nestlewatersna.com',
        'Bottled water supplier',
        12000.00,
        40000.00,
        TRUE
    ),
    (
        4,
        1,
        'Procter & Gamble',
        'Emily Wilson',
        '+1 513-983-1100',
        'orders@pg.com',
        '1 Procter & Gamble Plaza, Cincinnati, OH 45202',
        'US310987654',
        'https://www.pg.com',
        'Household and personal care',
        25000.00,
        80000.00,
        TRUE
    ),
    (
        5,
        1,
        'Frito-Lay',
        'Robert Taylor',
        '+1 972-334-6000',
        'orders@fritolay.com',
        '7701 Legacy Drive, Plano, TX 75024',
        'US750123456',
        'https://www.fritolay.com',
        'Snacks and chips supplier',
        18000.00,
        60000.00,
        TRUE
    ),
    (
        6,
        1,
        'Mondelez International',
        'Jennifer Martinez',
        '+1 847-943-4000',
        'orders@mdlz.com',
        '905 West Fulton Market, Chicago, IL 60607',
        'US360654321',
        'https://www.mondelezinternational.com',
        'Candy and chocolate supplier',
        22000.00,
        70000.00,
        TRUE
    ),

-- Company 2 Suppliers (The Bookworm)
(
    7,
    2,
    'Penguin Random House',
    'David Brown',
    '+44 20 7840 5400',
    'orders@penguinrandomhouse.co.uk',
    '1745 Broadway, New York, NY 10019',
    'GB130123456',
    'https://www.penguinrandomhouse.co.uk',
    'Major UK publisher',
    45000.00,
    200000.00,
    TRUE
),
(
    8,
    2,
    'HarperCollins Publishers',
    'Lisa Anderson',
    '+44 20 8447 7000',
    'orders@harpercollins.co.uk',
    '195 Broadway, New York, NY 10007',
    'GB130987654',
    'https://www.harpercollins.co.uk',
    'International publisher',
    38000.00,
    180000.00,
    TRUE
),
(
    9,
    2,
    'Simon & Schuster',
    'Michael Thompson',
    '+44 20 7490 3600',
    'orders@simonandschuster.co.uk',
    '1230 Avenue of the Americas, New York, NY 10020',
    'GB131654321',
    'https://www.simonandschuster.co.uk',
    'Global publishing company',
    42000.00,
    190000.00,
    TRUE
),
(
    10,
    2,
    'Hachette Book Group',
    'Emma Davis',
    '+44 20 7636 5000',
    'orders@hachette.co.uk',
    '1290 Avenue of the Americas, New York, NY 10104',
    'GB131321654',
    'https://www.hachette.co.uk',
    'UK and international publisher',
    35000.00,
    160000.00,
    TRUE
),
(
    11,
    2,
    'Scholastic Corporation',
    'Robert Wilson',
    '+44 20 7756 7700',
    'orders@scholastic.co.uk',
    '557 Broadway, New York, NY 10012',
    'GB131987654',
    'https://www.scholastic.co.uk',
    'Children books specialist',
    28000.00,
    140000.00,
    TRUE
),
(
    12,
    2,
    'Moleskine',
    'Jennifer Taylor',
    '+39 02 4950 2111',
    'orders@moleskine.com',
    'Via Brioschi 28, Milan 20134, Italy',
    'IT0123456789',
    'https://www.moleskine.com',
    'Premium notebooks and stationery',
    15000.00,
    80000.00,
    TRUE
);

-- ============= BRANDS =============
INSERT IGNORE INTO
    brands (
        company_id,
        name,
        description,
        website
    )
VALUES
    -- Company 1 Brands (Quick Stop)
    (
        1,
        'Coca-Cola',
        'Carbonated soft drinks',
        'https://www.coca-cola.com'
    ),
    (
        1,
        'Pepsi',
        'Carbonated soft drinks and beverages',
        'https://www.pepsi.com'
    ),
    (
        1,
        'Dasani',
        'Purified bottled water by Coca-Cola',
        'https://www.dasani.com'
    ),
    (
        1,
        'Aquafina',
        'Purified bottled water by PepsiCo',
        'https://www.aquafina.com'
    ),
    (
        1,
        'Red Bull',
        'Energy drinks',
        'https://www.redbull.com'
    ),
    (
        1,
        'Monster Energy',
        'Energy drinks',
        'https://www.monsterenergy.com'
    ),
    (
        1,
        'Lay''s',
        'Potato chips and snacks',
        'https://www.lays.com'
    ),
    (
        1,
        'Doritos',
        'Tortilla chips and snacks',
        'https://www.doritos.com'
    ),
    (
        1,
        'Oreo',
        'Chocolate sandwich cookies',
        'https://www.oreo.com'
    ),
    (
        1,
        'Cheetos',
        'Cheese-flavored snacks',
        'https://www.cheetos.com'
    ),
    (
        1,
        'Tide',
        'Laundry detergent',
        'https://www.tide.com'
    ),
    (
        1,
        'Dawn',
        'Dish soap and cleaning products',
        'https://www.dawn-dish.com'
    ),
    (
        1,
        'Bounty',
        'Paper towels',
        'https://www.bountytowels.com'
    ),
    (
        1,
        'Charmin',
        'Toilet paper and bathroom tissue',
        'https://www.charmin.com'
    ),
    (
        1,
        'Maruchan',
        'Instant ramen noodles',
        'https://www.maruchan.com'
    ),

-- Company 2 Brands (The Bookworm)
(
    2,
    'Penguin Classics',
    'Classic literature imprint',
    'https://www.penguin.co.uk/classics'
),
(
    2,
    'Vintage',
    'Contemporary fiction imprint',
    'https://www.vintage-books.co.uk'
),
(
    2,
    'Harper Perennial',
    'Modern classics imprint',
    'https://www.harperperennial.com'
),
(
    2,
    'Simon & Schuster',
    'Main publishing imprint',
    'https://www.simonandschuster.com'
),
(
    2,
    'Little, Brown and Company',
    'Literary fiction imprint',
    'https://www.littlebrown.com'
),
(
    2,
    'Scholastic',
    'Children books publisher',
    'https://www.scholastic.co.uk'
),
(
    2,
    'Puffin Books',
    'Children books imprint',
    'https://www.puffin.co.uk'
),
(
    2,
    'Faber & Faber',
    'Independent UK publisher',
    'https://www.faber.co.uk'
),
(
    2,
    'Bloomsbury Publishing',
    'Independent publisher',
    'https://www.bloomsbury.com'
),
(
    2,
    'Moleskine',
    'Premium notebooks and journals',
    'https://www.moleskine.com'
),
(
    2,
    'Papermate',
    'Writing instruments and pens',
    'https://www.papermate.com'
),
(
    2,
    'Sharpie',
    'Permanent markers and pens',
    'https://www.sharpie.com'
),
(
    2,
    'Post-it',
    'Adhesive notes and office supplies',
    'https://www.post-it.com'
);

-- Update statistics and verification queries at the end
-- Note: Total records inserted:
-- - Companies: 2
-- - Branches: 4
-- - Users: 8 (with auth records)
-- - Categories: 17 (hierarchical structure with colors and icons)
-- - Suppliers: 12
-- - Brands: 28
-- - Categories include proper color coding and icon support for UI