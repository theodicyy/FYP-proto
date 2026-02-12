-- ============================================================
-- Capability Statement Platform - Unified Production Schema
-- MySQL 8.0+
-- ============================================================

DROP DATABASE IF EXISTS capability_statement_db;
CREATE DATABASE capability_statement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE capability_statement_db;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_type ENUM('admin','associate') DEFAULT 'associate',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(191) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TEMPLATES
-- ============================================================

CREATE TABLE templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- CAPABILITY STATEMENTS
-- ============================================================

CREATE TABLE cap_statements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_by_user_id INT,
  template_id INT,
  generated_content LONGTEXT,
  edited_content LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
) ENGINE=InnoDB;

CREATE TABLE cap_statement_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cap_statement_id INT NOT NULL,
  version_number INT,
  version_name VARCHAR(255),
  content LONGTEXT,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (cap_statement_id) REFERENCES cap_statements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LAWYERS
-- ============================================================

CREATE TABLE lawyers (
  id INT AUTO_INCREMENT PRIMARY KEY,

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(191),

  practice_group VARCHAR(100),
  title VARCHAR(100),
  designation VARCHAR(100),

  phone TEXT,
  qualifications TEXT,
  admissions TEXT,
  bio TEXT,
  years_experience INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- DEALS
-- ============================================================

CREATE TABLE deals (
  id INT AUTO_INCREMENT PRIMARY KEY,

  deal_name VARCHAR(255),
  client_name VARCHAR(255),

  deal_summary TEXT,
  significant_features TEXT,
  notability ENUM('Yes','No'),
  notable_reason TEXT,
  acting_for VARCHAR(50),

  deal_value DECIMAL(15,2),
  currency VARCHAR(50),

  jurisdiction VARCHAR(100),

  deal_date DATE,
  signing_date DATE,
  completion_date DATE,

  publicity_purposes JSON,
  confidentiality JSON,

  transaction_types JSON,
  srb_related JSON,
  pe_related JSON,
  startup_or_vc_related JSON,
  featured_other_areas JSON,

  deal_pg JSON,
  past_clients TEXT,

  remarks TEXT,
  partner_approval ENUM('Yes','No'),
  partner_initial VARCHAR(20),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- AWARDS
-- ============================================================

CREATE TABLE awards (
  id INT AUTO_INCREMENT PRIMARY KEY,

  award_name VARCHAR(255),
  awarding_organization VARCHAR(255),
  award_year INT,
  category VARCHAR(100),

  description TEXT,
  award_pg JSON,
  publications TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- RELATION TABLES
-- ============================================================

CREATE TABLE deal_lawyers (
  deal_id INT NOT NULL,
  lawyer_id INT NOT NULL,
  role ENUM('Partner','Senior Associate','Associate','Other'),

  PRIMARY KEY (deal_id, lawyer_id),

  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lawyer_awards (
  lawyer_id INT NOT NULL,
  award_id INT NOT NULL,

  PRIMARY KEY (lawyer_id, award_id),

  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
  FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE deal_awards (
  deal_id INT NOT NULL,
  award_id INT NOT NULL,

  PRIMARY KEY (deal_id, award_id),

  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_lawyer_name ON lawyers(last_name, first_name);
CREATE INDEX idx_deal_name ON deals(deal_name);
CREATE INDEX idx_award_name ON awards(award_name);
-- ======================
-- USERS
-- ======================

INSERT INTO users (email, password_hash, first_name, last_name, role_type)
VALUES
('admin@lawfirm.com', '$2b$10$IgnDq53RVBLdLvlMEqEV4uoGH7pv9NxPGjvzUNtiBcaYV2tzPKwx6', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '$2b$10$lHNjd8.21I2g9wT5JBylGuyatDnaRHgCk1xWWs6dwhvplaZjdpX7m', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email=email;

-- ======================
-- LAWYERS
-- ======================

INSERT INTO lawyers
(first_name,last_name,email,practice_group,title,designation,phone,qualifications,admissions,bio,years_experience)
VALUES
('Jane','Tan','jane@firm.com','Corporate','Partner','Head Partner','91234567','LLB (NUS)','Singapore Bar','Corporate specialist',18),
('Mark','Lim','mark@firm.com','Litigation','Partner','Co-Head','92345678','LLB (SMU)','Singapore Bar','Dispute resolution expert',15),
('Alicia','Ng','alicia@firm.com','Corporate','Associate','Associate','93456789','LLB (NUS)','Singapore Bar','M&A lawyer',6),
('Daniel','Koh','daniel@firm.com','Regulatory','Associate','Associate','94567890','LLB (SMU)','Singapore Bar','Regulatory advisory',5);

-- ======================
-- DEALS
-- ======================

INSERT INTO deals
(deal_name,client_name,deal_summary,significant_features,acting_for,deal_value,currency,jurisdiction,deal_date)
VALUES
('Tech Acquisition','AlphaTech Pte Ltd','Advised on acquisition of SaaS company','Cross-border','Buyer',12000000,'USD','Singapore','2024-01-12'),
('Healthcare Merger','HealthCorp Asia','Merger of regional healthcare providers','Complex restructuring','Seller',8000000,'USD','Singapore','2023-11-02'),
('Manufacturing JV','SteelWorks Ltd','Joint venture for manufacturing expansion','JV structuring','JV Partner',5000000,'USD','Malaysia','2022-09-15');

-- ======================
-- AWARDS
-- ======================

INSERT INTO awards
(award_name,awarding_organization,award_year,category,description)
VALUES
('Best Corporate Law Firm','Legal500',2024,'Corporate','Top ranked corporate team'),
('Dispute Resolution Excellence','Chambers',2023,'Litigation','Outstanding litigation practice'),
('Rising Star Firm','Asian Legal Business',2022,'General','Fast growing regional firm');

-- ======================
-- RELATION TABLES
-- ======================

-- Link lawyers to deals
INSERT IGNORE INTO deal_lawyers (deal_id, lawyer_id, role)
SELECT d.id, l.id, 'Partner'
FROM deals d, lawyers l
WHERE l.first_name IN ('Jane','Mark')
LIMIT 2;

-- Associate lawyers
INSERT IGNORE INTO deal_lawyers (deal_id, lawyer_id, role)
SELECT d.id, l.id, 'Associate'
FROM deals d, lawyers l
WHERE l.first_name IN ('Alicia','Daniel')
LIMIT 2;

-- Lawyer awards
INSERT IGNORE INTO lawyer_awards (lawyer_id, award_id)
SELECT l.id, a.id
FROM lawyers l, awards a
LIMIT 3;

-- Deal awards
INSERT IGNORE INTO deal_awards (deal_id, award_id)
SELECT d.id, a.id
FROM deals d, awards a
LIMIT 3;