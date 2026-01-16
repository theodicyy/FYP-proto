-- Migration: Simple Step-by-Step Version
-- Run each section separately in phpMyAdmin SQL tab
-- This avoids any procedure or complex logic issues

USE capability_statement_db;

-- ============================================
-- STEP 1: Create Templates Table
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 2: Add template_id column
-- ============================================
-- Run this, ignore error if column already exists
ALTER TABLE cap_statements ADD COLUMN template_id INT NULL;

-- ============================================
-- STEP 3: Add generated_content column
-- ============================================
-- Run this, ignore error if column already exists
ALTER TABLE cap_statements ADD COLUMN generated_content TEXT NULL;

-- ============================================
-- STEP 4: Add edited_content column
-- ============================================
-- Run this, ignore error if column already exists
ALTER TABLE cap_statements ADD COLUMN edited_content TEXT NULL;

-- ============================================
-- STEP 5: Add Foreign Key
-- ============================================
-- Run this AFTER all columns are added
-- Ignore error if constraint already exists
ALTER TABLE cap_statements 
ADD CONSTRAINT cap_statements_ibfk_template 
FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- ============================================
-- STEP 6: Insert Sample Templates
-- ============================================
-- Run this to add default templates
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
