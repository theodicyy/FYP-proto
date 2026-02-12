-- ============================================================
-- Capability Statement Platform - Production Database Schema
-- MySQL 8.0+
-- ============================================================
CREATE DATABASE IF NOT EXISTS lawyer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS deal_db   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS award_db  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS capability_statement_db;
USE capability_statement_db;

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_type ENUM('admin', 'associate') NOT NULL DEFAULT 'associate',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CAPABILITY STATEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS cap_statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by_user_id INT NULL,
    template_id INT NULL,
    generated_content LONGTEXT,
    edited_content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cap_statement_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cap_statement_id INT NOT NULL,
    version_number INT NOT NULL,
    version_name VARCHAR(255),
    content LONGTEXT NOT NULL,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_statement_id) REFERENCES cap_statements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DEFAULT USERS
-- ============================================================

INSERT INTO users (email, password_hash, first_name, last_name, role_type) VALUES
('admin@lawfirm.com', '$2b$10$IgnDq53RVBLdLvlMEqEV4uoGH7pv9NxPGjvzUNtiBcaYV2tzPKwx6', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '$2b$10$lHNjd8.21I2g9wT5JBylGuyatDnaRHgCk1xWWs6dwhvplaZjdpX7m', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email=email;

-- ============================================================
-- DEFAULT TEMPLATES (INCLUDING WONGP RICH HTML TEMPLATE)
-- ============================================================

INSERT INTO templates (name, description, content) VALUES
(
'Standard Corporate Template',
'Legacy corporate template',
'{{lawyers}}{{deals}}{{awards}}Generated on {{date}}'
),
(
'Focused Practice Template',
'Legacy focused template',
'{{lawyers}}{{deals}}{{awards}}Generated on {{date}}'
),
(
'WongP Manual Input Template',
'Wong Partnership – Manual UI Phase 1',
'
<div style="font-family: Times New Roman, serif; color:#000; line-height:1.6;">

  <div style="text-align:center; margin-bottom:60px;">
    <h1 style="font-size:32px; font-weight:bold;">CAPABILITY STATEMENT</h1>
    <p style="font-size:18px;">{{client_name}}</p>
    <p style="font-size:14px;">{{date}}</p>
  </div>

  <h2>INTRODUCTION</h2>
  <p>
    This capability statement is submitted by Wong Partnership LLP in response to
    <strong>{{client_name}}</strong>
    {{#if tender_number}}in relation to Tender No. {{tender_number}}{{/if}}.
  </p>

  <h2>MATTER OVERVIEW</h2>
  <table border="1" cellpadding="8" cellspacing="0" width="100%">
    <tr><td><strong>Document Type</strong></td><td>{{doc_type}}</td></tr>
    <tr><td><strong>Matter Type</strong></td><td>{{matter_type}}</td></tr>
    <tr><td><strong>Client Type</strong></td><td>{{client_type}}</td></tr>
    <tr><td><strong>Main Practice Area</strong></td><td>{{main_practice_area}}</td></tr>
  </table>

  <h2>DESCRIPTION OF MATTER</h2>
  <p>{{matter_desc}}</p>

  <h2>SCOPE OF WORK</h2>
  <p>{{scope_of_work}}</p>
  <ul>{{scope_of_work_list}}</ul>

  <h2>FEES & ASSUMPTIONS</h2>
  <p><strong>Discount Rate:</strong> {{discount_rate}}</p>
  <p>{{fee_assumptions}}</p>

  {{#if highlights_track_record_bool}}
  <h2>HIGHLIGHTS & TRACK RECORD</h2>
  <p>[To be populated from marketing document]</p>
  {{/if}}

  <h2>OUR TEAM</h2>
  <p><em>[From marketing document]</em></p>

  <h2>RELEVANT EXPERIENCE</h2>
  <p><em>[From marketing document]</em></p>

  <hr />
  <p style="font-size:12px; text-align:center;">Generated on {{date}}</p>

</div>
'
)
ON DUPLICATE KEY UPDATE name=name;


-- LAWYERS DB
USE lawyer_db;
CREATE TABLE IF NOT EXISTS lawyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  practice_group VARCHAR(100),
  title VARCHAR(100),
  bio TEXT,
  years_experience INT,
  lawyer_phone_nos TEXT,
  lawyer_qualifications TEXT,
  lawyer_admissions TEXT,
  lawyer_designation TEXT,
  lawyer_awards JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DEALS DB
USE deal_db;
CREATE TABLE IF NOT EXISTS deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deal_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  deal_value DECIMAL(15,2),
  deal_currency VARCHAR(10),
  industry VARCHAR(100),
  practice_group VARCHAR(100),
  deal_year INT,
  deal_description TEXT,

  publicity_purposes JSON,
  confidentiality JSON,
  deal_summary TEXT,
  significant_features TEXT,
  notability VARCHAR(255),
  notable_reason TEXT,
  acting_for VARCHAR(255),

  parties_advised_coyname TEXT,
  parties_advised_name TEXT,
  parties_advised_designation TEXT,
  parties_advised_telephone TEXT,
  parties_advised_email TEXT,
  industry_of_parties_advised TEXT,
  business_desc_of_parties TEXT,

  target_nationandbiz_desc TEXT,
  acquiror_nationandbiz_desc TEXT,

  deal_value_range VARCHAR(255),
  currency VARCHAR(50),
  deal_size DECIMAL(15,2),
  is_cross_border VARCHAR(255),

  target_name TEXT,
  acquiror_name TEXT,
  sellers_name TEXT,
  investors_name TEXT,
  lenders_name TEXT,

  deal_date DATE,
  signing_date DATE,
  completion_date DATE,

  referral VARCHAR(255),
  referral_party TEXT,

  transaction_types JSON,
  srb_related VARCHAR(255),
  pe_related VARCHAR(255),
  startup_or_vc_related VARCHAR(255),
  featured_other_areas TEXT,
  jurisdiction TEXT,
  deal_industry_t1 TEXT,
  deal_industry_t2 TEXT,

  remarks TEXT,
  partner_approval VARCHAR(255),
  partner_initial TEXT,

  deal_pg JSON,
  past_clients TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AWARDS DB
USE award_db;
CREATE TABLE IF NOT EXISTS awards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  award_name VARCHAR(255) NOT NULL,
  awarding_organization VARCHAR(255),
  award_year INT,
  category VARCHAR(100),
  practice_group VARCHAR(100),
  industry VARCHAR(100),
  description TEXT,

  award_pg JSON,
  publications TEXT,
  award_years DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
