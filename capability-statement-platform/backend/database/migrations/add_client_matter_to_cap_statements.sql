-- Migration: add client_name and matter_number columns to cap_statements
-- Run once against capability_statement_db

USE capability_statement_db;

ALTER TABLE cap_statements
  ADD COLUMN client_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN matter_number VARCHAR(100) DEFAULT NULL;
