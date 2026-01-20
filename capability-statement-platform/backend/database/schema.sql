-- ============================================================
-- Capability Statement Platform - Production Database Schema
-- MySQL 8.0+
-- ============================================================
-- 
-- SETUP INSTRUCTIONS:
-- 1. Create database in phpMyAdmin or MySQL CLI
-- 2. Import this file directly via phpMyAdmin SQL tab
-- 3. Default users will be created (change passwords in production!)
--
-- ============================================================

CREATE DATABASE IF NOT EXISTS capability_statement_db;
USE capability_statement_db;

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_type ENUM('admin', 'associate') NOT NULL DEFAULT 'associate',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role_type (role_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions (token-based auth)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REFERENCE DATA: LAWYERS
-- ============================================================

CREATE TABLE IF NOT EXISTS lawyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    practice_group VARCHAR(100),
    title VARCHAR(100),
    bio TEXT,
    years_experience INT,
    source_system VARCHAR(50),
    deleted_at TIMESTAMP NULL,
    deleted_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_practice_group (practice_group),
    INDEX idx_source_system (source_system),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REFERENCE DATA: DEALS
-- ============================================================

CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    deal_value DECIMAL(15, 2),
    deal_currency VARCHAR(10) DEFAULT 'USD',
    industry VARCHAR(100),
    practice_group VARCHAR(100),
    deal_year INT,
    deal_description TEXT,
    deal_type VARCHAR(50),
    source_system VARCHAR(50),
    deleted_at TIMESTAMP NULL,
    deleted_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_industry (industry),
    INDEX idx_practice_group (practice_group),
    INDEX idx_deal_year (deal_year),
    INDEX idx_source_system (source_system),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deal-Lawyer Relationship
CREATE TABLE IF NOT EXISTS deal_lawyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_deal_lawyer (deal_id, lawyer_id),
    INDEX idx_deal_id (deal_id),
    INDEX idx_lawyer_id (lawyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REFERENCE DATA: AWARDS
-- ============================================================

CREATE TABLE IF NOT EXISTS awards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    award_name VARCHAR(255) NOT NULL,
    awarding_organization VARCHAR(255),
    award_year INT,
    category VARCHAR(100),
    practice_group VARCHAR(100),
    industry VARCHAR(100),
    description TEXT,
    source_system VARCHAR(50),
    deleted_at TIMESTAMP NULL,
    deleted_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_award_year (award_year),
    INDEX idx_practice_group (practice_group),
    INDEX idx_industry (industry),
    INDEX idx_source_system (source_system),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Award-Lawyer Relationship
CREATE TABLE IF NOT EXISTS award_lawyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    award_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_award_lawyer (award_id, lawyer_id),
    INDEX idx_award_id (award_id),
    INDEX idx_lawyer_id (lawyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SIMPLE TEMPLATES (Text-based with placeholders)
-- ============================================================

CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    deleted_at TIMESTAMP NULL,
    deleted_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- STRUCTURED TEMPLATES (Rich content with JSON structure)
-- ============================================================

-- Template Definitions (immutable structure)
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

-- Template Content (editable content values)
CREATE TABLE IF NOT EXISTS template_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_definition_id INT NOT NULL,
    page_number INT NOT NULL,
    section_id VARCHAR(100) NOT NULL COMMENT 'Identifier for section within page',
    element_id VARCHAR(100) NOT NULL COMMENT 'Identifier for element within section',
    content_type ENUM('text', 'html', 'data') DEFAULT 'text',
    content_value LONGTEXT COMMENT 'Editable content value',
    is_enabled BOOLEAN DEFAULT TRUE,
    metadata JSON COMMENT 'Additional metadata for the content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE,
    INDEX idx_template_page (template_definition_id, page_number),
    INDEX idx_section (template_definition_id, section_id),
    UNIQUE KEY unique_content (template_definition_id, page_number, section_id, element_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Template Versions (version history for rollback)
CREATE TABLE IF NOT EXISTS template_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_definition_id INT NOT NULL,
    version_number INT NOT NULL,
    structure_json LONGTEXT NOT NULL,
    styles_json LONGTEXT,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_definition_id) REFERENCES template_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_template_version (template_definition_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CAPABILITY STATEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS cap_statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by VARCHAR(100),
    created_by_user_id INT NULL,
    template_id INT NULL COMMENT 'Can reference templates or template_definitions',
    generated_content LONGTEXT NULL,
    edited_content LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_created_by_user_id (created_by_user_id),
    INDEX idx_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cap Statement Versions
CREATE TABLE IF NOT EXISTS cap_statement_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cap_statement_id INT NOT NULL,
    version_number INT NOT NULL,
    version_name VARCHAR(255) NULL,
    content LONGTEXT NOT NULL,
    settings JSON,
    selected_deal_ids JSON,
    selected_award_ids JSON,
    selected_lawyer_ids JSON,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_statement_id) REFERENCES cap_statements(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cap_statement_id (cap_statement_id),
    INDEX idx_version_number (version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Default users (CHANGE PASSWORDS IN PRODUCTION!)
-- Admin password: admin123
-- Associate password: associate123
INSERT INTO users (email, password_hash, first_name, last_name, role_type) VALUES
('admin@lawfirm.com', '$2b$10$IgnDq53RVBLdLvlMEqEV4uoGH7pv9NxPGjvzUNtiBcaYV2tzPKwx6', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '$2b$10$lHNjd8.21I2g9wT5JBylGuyatDnaRHgCk1xWWs6dwhvplaZjdpX7m', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email=email;

-- Default simple templates
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
')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================
-- OPTIONAL: SAMPLE DATA FOR TESTING
-- Uncomment and run separately if needed for testing
-- ============================================================

/*
-- Sample Lawyers
INSERT INTO lawyers (first_name, last_name, email, practice_group, title, bio, years_experience, source_system) VALUES
('John', 'Smith', 'john.smith@lawfirm.com', 'Corporate Law', 'Partner', 'Expert in M&A transactions with 20+ years of experience', 20, 'HRIS'),
('Sarah', 'Johnson', 'sarah.johnson@lawfirm.com', 'Intellectual Property', 'Senior Associate', 'Specializes in patent law and IP litigation', 8, 'HRIS'),
('Michael', 'Chen', 'michael.chen@lawfirm.com', 'Corporate Law', 'Partner', 'Leading expert in securities law and regulatory compliance', 18, 'HRIS');

-- Sample Deals
INSERT INTO deals (deal_name, client_name, deal_value, deal_currency, industry, practice_group, deal_year, deal_description, deal_type, source_system) VALUES
('TechCorp Acquisition', 'TechCorp Inc.', 500000000.00, 'USD', 'Technology', 'Corporate Law', 2023, 'Represented TechCorp in acquisition of competitor', 'M&A', 'DealTracker'),
('PharmaCo IPO', 'PharmaCo Ltd.', 750000000.00, 'USD', 'Healthcare', 'Corporate Law', 2023, 'Led initial public offering for pharmaceutical company', 'IPO', 'DealTracker');

-- Sample Awards
INSERT INTO awards (award_name, awarding_organization, award_year, category, practice_group, industry, description, source_system) VALUES
('Lawyer of the Year - Corporate', 'Legal Excellence Awards', 2023, 'Individual', 'Corporate Law', 'General', 'Recognized for outstanding work in corporate transactions', 'AwardsDB'),
('Top M&A Deal', 'M&A Magazine', 2023, 'Deal', 'Corporate Law', 'Technology', 'TechCorp Acquisition named top M&A deal of the year', 'AwardsDB');
*/

-- ============================================================
-- END OF SCHEMA
-- ============================================================
