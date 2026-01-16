-- Migration: Add Templates and Editing Support (Fixed Version)
-- Run this after the initial schema
-- This version ensures columns are added before foreign key

USE capability_statement_db;

-- Step 1: Create Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add columns to cap_statements (run individually, ignore errors if columns exist)
-- Check and add template_id
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND COLUMN_NAME = 'template_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE cap_statements ADD COLUMN template_id INT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add generated_content
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND COLUMN_NAME = 'generated_content'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE cap_statements ADD COLUMN generated_content TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add edited_content
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND COLUMN_NAME = 'edited_content'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE cap_statements ADD COLUMN edited_content TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add foreign key constraint (only if column exists and constraint doesn't exist)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND COLUMN_NAME = 'template_id'
);

SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND CONSTRAINT_NAME = 'cap_statements_ibfk_template'
);

SET @sql = IF(@col_exists > 0 AND @fk_exists = 0,
    'ALTER TABLE cap_statements ADD CONSTRAINT cap_statements_ibfk_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Insert sample templates (only if they don't exist)
INSERT IGNORE INTO templates (id, name, description, content) VALUES
(1, 'Standard Corporate Template', 'Standard template for corporate practice capability statements', 
'CAPABILITY STATEMENT
===================

{{lawyers}}

{{deals}}

{{awards}}

---
Generated on: {{date}}
'),

(2, 'Focused Practice Template', 'Template focused on specific practice area',
'PRACTICE OVERVIEW
=================

Our team brings extensive experience in corporate transactions and regulatory matters.

{{lawyers}}

RECENT TRANSACTIONS
-------------------

{{deals}}

RECOGNITIONS
------------

{{awards}}

---
Generated on: {{date}}
'),

(3, 'Detailed Template', 'Comprehensive template with full details',
'CAPABILITY STATEMENT
===================

EXECUTIVE SUMMARY
-----------------
This capability statement highlights our firm''s expertise and recent achievements.

OUR TEAM
--------
{{lawyers}}

TRANSACTION HIGHLIGHTS
---------------------
{{deals}}

AWARDS & RECOGNITIONS
--------------------
{{awards}}

---
Generated on: {{date}}
');
