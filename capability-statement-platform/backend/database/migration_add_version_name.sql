-- Migration: Add version_name column to cap_statement_versions
-- Allows users to give custom names to versions

ALTER TABLE cap_statement_versions 
ADD COLUMN version_name VARCHAR(255) NULL 
AFTER version_number;

-- Optional: Add index for faster lookups by name (can be skipped if not needed)
-- CREATE INDEX idx_version_name ON cap_statement_versions(version_name);
