-- =============================================
-- V11__Add_company_store_fields.sql
-- Purpose: Extend companies table with store info fields
-- =============================================

ALTER TABLE companies
    ADD COLUMN country VARCHAR(100) AFTER address,
    ADD COLUMN country_flag VARCHAR(10) AFTER country,
    ADD COLUMN province VARCHAR(255) AFTER country_flag,
    ADD COLUMN ward VARCHAR(255) AFTER province,
    ADD COLUMN logo_url TEXT AFTER ward;
