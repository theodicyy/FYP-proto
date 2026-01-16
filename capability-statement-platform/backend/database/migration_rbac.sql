-- Migration: Role-Based Access Control (RBAC)
-- Step 7: RBAC Implementation
-- Run this to add user authentication and role management

USE capability_statement_db;

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

-- Sessions Table (for token-based auth)
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

-- Add created_by and updated_by to existing tables for audit trail
-- cap_statements already has created_by, but let's ensure it references users
ALTER TABLE cap_statements 
ADD COLUMN IF NOT EXISTS created_by_user_id INT NULL,
ADD FOREIGN KEY IF NOT EXISTS cap_statements_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to reference tables
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS deleted_by_user_id INT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

ALTER TABLE awards 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS deleted_by_user_id INT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS deleted_by_user_id INT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

ALTER TABLE lawyers 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS deleted_by_user_id INT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

-- Update cap_statement_versions to include created_by_user_id
ALTER TABLE cap_statement_versions 
ADD COLUMN IF NOT EXISTS created_by_user_id INT NULL,
ADD FOREIGN KEY IF NOT EXISTS cap_statement_versions_ibfk_user 
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
-- Password hash for 'admin123' using bcrypt (you'll need to generate this properly)
INSERT INTO users (email, password_hash, first_name, last_name, role_type) VALUES
('admin@lawfirm.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email=email;
