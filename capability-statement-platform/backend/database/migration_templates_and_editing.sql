-- Migration: Add Templates and Editing Support
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

-- Update cap_statements table to add template_id, generated_content, edited_content
-- Note: If columns already exist, you'll get an error - just ignore it or run the individual ALTER statements

-- Add template_id column (skip if already exists)
ALTER TABLE cap_statements 
ADD COLUMN template_id INT NULL;

-- Add generated_content column (skip if already exists)
ALTER TABLE cap_statements 
ADD COLUMN generated_content TEXT NULL;

-- Add edited_content column (skip if already exists)
ALTER TABLE cap_statements 
ADD COLUMN edited_content TEXT NULL;

-- Add foreign key constraint (skip if already exists)
ALTER TABLE cap_statements 
ADD CONSTRAINT cap_statements_ibfk_template 
FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- Insert sample templates
INSERT INTO templates (name, description, content) VALUES
('Standard Corporate Template', 'Standard template for corporate practice capability statements', 
'CAPABILITY STATEMENT
===================

{{lawyers}}

{{deals}}

{{awards}}

---
Generated on: {{date}}
'),

('Focused Practice Template', 'Template focused on specific practice area',
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

('Detailed Template', 'Comprehensive template with full details',
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
