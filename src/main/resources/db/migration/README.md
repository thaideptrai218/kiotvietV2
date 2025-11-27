# Database Migration Files

This directory contains Flyway database migration files for the Kiotviet multi-tenant product management system.

## Migration Structure

### Core Schema (V1-V5)
- `V1__Create_kiotviet_core_tables.sql` - Multi-tenant foundation (companies, branches, users, auth)
- `V2__Create_password_reset_tokens.sql` - Password reset functionality
- `V3__Create_suppliers_table.sql` - Supplier management
- `V4__Create_categories_table.sql` - Hierarchical category system
- `V5__Create_products_schema.sql` - Products, brands, and product images

### Schema Fixes (V6, V9-V11_1)
- `V6__Enhanced_schema_fixes.sql` - Consolidated schema enhancements (ENUM fixes, user fields, company fields)
- `V9__Create_purchase_entries_schema.sql` - Purchase order management
- `V10__Create_orders_tables.sql` - Sales orders and order items
- `V10_1__Add_note_to_orders.sql` - Add note column to orders (dependency: after V10)
- `V11__create_inventory_count_tables.sql` - Inventory counting system
- `V11_1__Add_merged_to_inventory_counts.sql` - Add merged_into column (dependency: after V11)

### Sample Data (V12-V14)
- `V12__Insert_sample_companies.sql` - Complete dataset for 2 companies (Quick Stop & The Bookworm)
- `V13__Insert_sample_products.sql` - 100 products across both companies
- `V14__Insert_sample_product_images.sql` - 99 product images with metadata

## Companies in Sample Data

### Company 1: Quick Stop Convenience Store
- **Location**: New York, USA 🇺🇸
- **Products**: 30 convenience store items (drinks, snacks, household supplies)
- **Login**: `admin_quickstop` / `admin123`

### Company 2: The Bookworm English Bookstore
- **Location**: London, UK 🇬🇧
- **Products**: 70 bookstore items (fiction, non-fiction, children's books, stationery)
- **Login**: `admin_bookworm` / `admin123`

## Running Migrations

```bash
# Run all pending migrations
./mvnw flyway:migrate

# Check migration status
./mvnw flyway:info

# Clean and restart (development only)
./mvnw flyway:clean
./mvnw flyway:migrate
```

## Migration Naming Convention

- `V<number>__<description>.sql` - Main migrations
- `V<number>_<subnumber>__<description>.sql` - Table modifications after table creation
- All migrations are numbered sequentially and run in order
- Sub-numbered migrations handle dependency resolution (e.g., add column after table creation)

## Important Notes

- All sample data uses English for international compatibility
- Default password for all users: `admin123`
- Multi-tenant isolation enforced at database level
- Comprehensive test data covering different retail business types

For detailed information, see `MIGRATION_CONSOLIDATION_SUMMARY.md`.