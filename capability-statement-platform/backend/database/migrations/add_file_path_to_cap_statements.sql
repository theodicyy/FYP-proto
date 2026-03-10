-- Migration: add file_path column to cap_statements
-- Run this once against capability_statement_db

USE capability_statement_db;

ALTER TABLE cap_statements
  ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) DEFAULT NULL;
