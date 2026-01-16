-- Capability Statement Platform Database Schema
-- For phpMyAdmin Import (database should already exist)
-- Remove CREATE DATABASE line if importing into existing database

USE capability_statement_db;

-- Lawyers Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_practice_group (practice_group),
    INDEX idx_source_system (source_system)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deals Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_industry (industry),
    INDEX idx_practice_group (practice_group),
    INDEX idx_deal_year (deal_year),
    INDEX idx_source_system (source_system)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deal-Lawyer Relationship Table
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

-- Awards Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_award_year (award_year),
    INDEX idx_practice_group (practice_group),
    INDEX idx_industry (industry),
    INDEX idx_source_system (source_system)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Award-Lawyer Relationship Table
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

-- Capability Statements Table
CREATE TABLE IF NOT EXISTS cap_statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cap Statement Versions Table
CREATE TABLE IF NOT EXISTS cap_statement_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cap_statement_id INT NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    settings JSON,
    selected_deal_ids JSON,
    selected_award_ids JSON,
    selected_lawyer_ids JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_statement_id) REFERENCES cap_statements(id) ON DELETE CASCADE,
    INDEX idx_cap_statement_id (cap_statement_id),
    INDEX idx_version_number (version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
