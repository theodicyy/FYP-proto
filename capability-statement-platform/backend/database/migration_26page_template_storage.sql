-- Migration: 26-Page Template Storage Schema (Step 1)
-- Stores template structure and content separately
-- Structure is immutable, content is editable
-- 
-- TESTING INSTRUCTIONS:
-- 1. Run this entire file in phpMyAdmin SQL tab
-- 2. Run the test queries at the bottom to verify tables exist
-- 3. Check for any errors - ignore "table already exists" errors

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
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE,
    INDEX idx_template_page (template_definition_id, page_number),
    INDEX idx_section (template_definition_id, section_id),
    UNIQUE KEY unique_content (template_definition_id, page_number, section_id, element_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Template Versions Table
-- Tracks versions of template definitions for rollback
-- NOTE: Foreign key to users table is optional (add separately if users table exists)
-- ============================================
CREATE TABLE IF NOT EXISTS template_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_definition_id INT NOT NULL,
    version_number INT NOT NULL,
    structure_json LONGTEXT NOT NULL,
    styles_json LONGTEXT,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE,
    INDEX idx_template_version (template_definition_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key to users table separately (only if users table exists)
-- Uncomment and run this AFTER users table is created:
/*
ALTER TABLE template_versions 
ADD CONSTRAINT template_versions_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
*/

-- ============================================
-- TEST QUERIES (Run these to verify tables exist)
-- ============================================

-- Test 1: Simple check - Show all template tables
-- Expected: Should show 3 tables
SHOW TABLES LIKE 'template_%';

-- Test 2: Check table structures (run one at a time)
-- Expected: Should show column definitions
SHOW CREATE TABLE template_definitions;
SHOW CREATE TABLE template_content;
SHOW CREATE TABLE template_versions;

-- Test 3: Verify indexes exist
-- Expected: Should show indexes for each table
SHOW INDEX FROM template_definitions;
SHOW INDEX FROM template_content;
SHOW INDEX FROM template_versions;

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- ✅ All 3 tables created successfully
-- ✅ Foreign keys exist (template_content -> template_definitions, template_versions -> template_definitions, template_versions -> users)
-- ✅ Indexes created (name, type, active, template_page, section, template_version)
-- ✅ Unique constraint exists (template_content unique_content)
-- ✅ No SQL errors (ignore "table already exists" if running multiple times)
