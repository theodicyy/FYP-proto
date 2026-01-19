-- Fix Foreign Key Constraint for Template References
-- 
-- PROBLEM:
-- The cap_statements.template_id foreign key only references templates(id)
-- But structured templates are stored in template_definitions(id)
-- When saving a capability statement with a structured template, MySQL rejects it
--
-- SOLUTION:
-- Remove the foreign key constraint since we support both template types
-- The template_id can reference either templates(id) or template_definitions(id)
-- Application logic will handle validation
--
-- INSTRUCTIONS:
-- Run this in phpMyAdmin SQL tab

USE capability_statement_db;

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE cap_statements 
DROP FOREIGN KEY cap_statements_ibfk_template;

-- Step 2: Verify the constraint is removed (this query should return no results)
-- SELECT * FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'capability_statement_db' 
--   AND TABLE_NAME = 'cap_statements' 
--   AND CONSTRAINT_NAME = 'cap_statements_ibfk_template';

-- Note: template_id column remains nullable and can store IDs from either:
-- - templates table (for simple templates)
-- - template_definitions table (for structured templates)
-- Application code will validate which table the ID belongs to