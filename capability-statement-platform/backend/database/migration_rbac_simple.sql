-- Migration: Role-Based Access Control (RBAC) - Simple Version
-- Step 7: RBAC Implementation
-- Run each section separately in phpMyAdmin

USE capability_statement_db;

-- ============================================
-- STEP 1: Create Users Table
-- ============================================
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

-- ============================================
-- STEP 2: Create Sessions Table
-- ============================================
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

-- ============================================
-- STEP 3: Add created_by_user_id to cap_statements
-- ============================================
-- Run this, ignore error if column already exists
ALTER TABLE cap_statements 
ADD COLUMN created_by_user_id INT NULL;

-- Add foreign key (run after column exists)
ALTER TABLE cap_statements 
ADD CONSTRAINT cap_statements_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- STEP 4: Add soft delete columns to reference tables
-- ============================================
-- Templates
ALTER TABLE templates 
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN deleted_by_user_id INT NULL;

-- Awards
ALTER TABLE awards 
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN deleted_by_user_id INT NULL;

-- Deals
ALTER TABLE deals 
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN deleted_by_user_id INT NULL;

-- Lawyers
ALTER TABLE lawyers 
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN deleted_by_user_id INT NULL;

-- ============================================
-- STEP 5: Add created_by_user_id to cap_statement_versions
-- ============================================
ALTER TABLE cap_statement_versions 
ADD COLUMN created_by_user_id INT NULL;

ALTER TABLE cap_statement_versions 
ADD CONSTRAINT cap_statement_versions_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- STEP 6: Insert default users
-- ============================================
-- NOTE: Password hashes will be automatically fixed to bcrypt on server startup
-- The server auto-converts SHA256 hashes to bcrypt format
-- Default passwords: 
--   admin@lawfirm.com / admin123
--   associate@lawfirm.com / associate123
-- These should be changed in production!
--
-- These are temporary SHA256 hashes - the server will auto-fix them on startup
-- If you want to set bcrypt hashes directly, run: node scripts/reset_default_passwords.js
INSERT INTO users (email, password_hash, first_name, last_name, role_type) VALUES
('admin@lawfirm.com', '122f137a81dc44e6ab559de0b98b43dc39169964e7ca35d6cc3962834c8732df', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '9befa70d8d59a6b0991e3ba6f912258d48f460579107d270b19736e656d83f31', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email=email;
