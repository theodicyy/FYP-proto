-- Migration: 26-Page Template Storage Schema (Step 1) - SAFE VERSION
-- Stores template structure and content separately
-- Structure is immutable, content is editable
-- 
-- TESTING INSTRUCTIONS:
-- 1. Run this entire file in phpMyAdmin SQL tab (one section at a time if needed)
-- 2. Run the simple test query at the bottom
-- 3. Check for any errors

USE capability_statement_db;

-- ============================================
-- Template Definitions Table
-- Stores the structure/layout of templates (immutable)
-- ============================================
CREATE TABLE IF NOT EXISTS template_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type ENUM('simple', 'multipage') DEFAULT 'simple',
    total_pages INT DEFAULT 1,
    structure_json LONGTEXT NOT NULL COMMENT 'JSON schema defining template structure',
    styles_json LONGTEXT COMMENT 'JSON schema defining template styles',
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (template_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Template Content Table
-- Stores editable content for template instances
-- ============================================
CREATE TABLE IF NOT EXISTS template_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_definition_id INT NOT NULL,
    page_number INT NOT NULL,
    section_id VARCHAR(100) NOT NULL COMMENT 'Identifier for section within page',
    element_id VARCHAR(100) NOT NULL COMMENT 'Identifier for element within section',
    content_type ENUM('text', 'html', 'data') DEFAULT 'text',
    content_value TEXT COMMENT 'Editable content value',
    is_enabled BOOLEAN DEFAULT TRUE,
    metadata JSON COMMENT 'Additional metadata for the content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_page (template_definition_id, page_number),
    INDEX idx_section (template_definition_id, section_id),
    UNIQUE KEY unique_content (template_definition_id, page_number, section_id, element_id),
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Template Versions Table
-- Tracks versions of template definitions for rollback
-- NOTE: Foreign key to users table - will fail if users table doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS template_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_definition_id INT NOT NULL,
    version_number INT NOT NULL,
    structure_json LONGTEXT NOT NULL,
    styles_json LONGTEXT,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_template_version (template_definition_id, version_number),
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key to users table only if users table exists
-- Run this separately if you get an error about users table
-- (Uncomment and run after users table is created)
/*
ALTER TABLE template_versions 
ADD CONSTRAINT template_versions_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
*/

-- ============================================
-- SIMPLE TEST QUERY (Run this first)
-- ============================================
-- This will show if tables exist
SHOW TABLES LIKE 'template_%';
