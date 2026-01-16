-- Migration: Add Templates and Editing Support (Safe Version)
-- This version checks if columns exist before adding them
-- Run this after the initial schema

USE capability_statement_db;

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns only if they don't exist
-- Using a stored procedure approach for MySQL compatibility

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_not_exists$$
CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_definition TEXT
)
BEGIN
    DECLARE column_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name
      AND COLUMN_NAME = column_name;
    
    IF column_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_name, ' ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Add columns using the procedure
CALL add_column_if_not_exists('cap_statements', 'template_id', 'INT NULL');
CALL add_column_if_not_exists('cap_statements', 'generated_content', 'TEXT NULL');
CALL add_column_if_not_exists('cap_statements', 'edited_content', 'TEXT NULL');

-- Add foreign key if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cap_statements'
      AND CONSTRAINT_NAME = 'cap_statements_ibfk_template'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE cap_statements ADD CONSTRAINT cap_statements_ibfk_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Clean up procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- Insert sample templates (only if they don't exist)
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
