-- ============================================================
-- Capability Statement Platform - Split Database Schema (B1)
-- Generated: 2026-02-10 04:00:22Z
--
-- Databases:
--   1) lawyers  -> core app + lawyers
--   2) deals    -> deals + deal_lawyers
--   3) awards   -> awards + award_lawyers
--
-- Notes:
-- - Cross-database foreign keys are removed (MySQL does not support them).
-- - Join tables keep IDs and indexes; app enforces integrity.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `lawyers` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `deals` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `awards` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- DATABASE: lawyers (core app + lawyers)
-- ============================================================
USE `lawyers`;

-- USERS & AUTHENTICATION
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `cap_statement_versions`;
DROP TABLE IF EXISTS `cap_statements`;
DROP TABLE IF EXISTS `templates`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `lawyers`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `role_type` ENUM('admin', 'associate') NOT NULL DEFAULT 'associate',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_sessions_user` (`user_id`),
  INDEX `idx_user_sessions_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- LAWYERS (includes Lawyer CV variables)
CREATE TABLE `lawyers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name`  VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `practice_group` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `years_experience` INT NULL,
  `source_system` VARCHAR(100) DEFAULT 'admin',

  -- === Lawyer CV variables from Data Table (2).xlsx ===
  `lawyer_phone_no` VARCHAR(50) NULL,
  `lawyer_qualifications` TEXT NULL,
  `lawyer_admissions` TEXT NULL,
  `lawyer_designation` VARCHAR(100) NULL,
  `lawyer_awards` TEXT NULL,

  -- Soft delete
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_by_user_id` INT NULL,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_lawyers_name` (`last_name`, `first_name`),
  INDEX `idx_lawyers_practice_group` (`practice_group`),
  INDEX `idx_lawyers_source_system` (`source_system`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TEMPLATES
CREATE TABLE `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `content` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_template_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CAPABILITY STATEMENTS
CREATE TABLE `cap_statements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` VARCHAR(50) DEFAULT 'draft',
  `created_by_user_id` INT NULL,
  `template_id` INT NULL,
  `generated_content` LONGTEXT,
  `edited_content` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `cap_statement_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cap_statement_id` INT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `version_name` VARCHAR(255),
  `created_by_user_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`cap_statement_id`) REFERENCES `cap_statements`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_versions_statement` (`cap_statement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DATABASE: deals
-- ============================================================
USE `deals`;

DROP TABLE IF EXISTS `deal_lawyers`;
DROP TABLE IF EXISTS `deals`;

CREATE TABLE `deals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,

  -- existing core fields
  `deal_name` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(255) NULL,
  `practice_group` VARCHAR(255) NULL,
  `jurisdiction` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `deal_date` DATE NULL,
  `source_system` VARCHAR(100) DEFAULT 'admin',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_by_user_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- === Deal variables from Data Table (2).xlsx ===
    `publicity_purposes` JSON NULL,
    `confidentiality` JSON NULL,
    `deal_summary` TEXT NULL,
    `significant_features` TEXT NULL,
    `notability` VARCHAR(100) NULL,
    `notable_reason` TEXT NULL,
    `acting_for` VARCHAR(100) NULL,
    `parties_advised_coyname` TEXT NULL,
    `parties_advised_name` TEXT NULL,
    `parties_advised_designation` TEXT NULL,
    `parties_advised_telephone` VARCHAR(50) NULL,
    `parties_advised_email` VARCHAR(255) NULL,
    `industry_of_parties_advised` TEXT NULL,
    `business_desc_of_parties` TEXT NULL,
    `target_nationandbiz_desc` TEXT NULL,
    `acquiror_nationandbiz_desc` TEXT NULL,
    `file_open_date` DATE NULL,
    `date_announced` DATE NULL,
    `deal_media` TEXT NULL,
    `date_completed` DATE NULL,
    `deal_value` DECIMAL(18,2) NULL,
    `currency_type` VARCHAR(10) NULL,
    `wongp_lawyers_partners` TEXT NULL,
    `wongp_lawyers_sa` TEXT NULL,
    `wongp_lawyers_a` TEXT NULL,
    `other_firms_involved` TEXT NULL,
    `other_firms_partners` TEXT NULL,
    `other_firms_sa` TEXT NULL,
    `other_firms_a` TEXT NULL,
    `referral` VARCHAR(100) NULL,
    `referral_party` TEXT NULL,
    `transaction_types` JSON NULL,
    `srb_related` JSON NULL,
    `pe_related` JSON NULL,
    `startup_or_vc_related` JSON NULL,
    `featured_other_areas` JSON NULL,
    `jurisdiction` TEXT NULL,
    `deal_industry_t1` TEXT NULL,
    `deal_industry_t2` TEXT NULL,
    `remarks` TEXT NULL,
    `partner_approval` VARCHAR(100) NULL,
    `partner_initial` VARCHAR(20) NULL,
    `deal_pg` JSON NULL,
    `past_clients` TEXT NULL,

  INDEX `idx_deals_name` (`deal_name`),
  INDEX `idx_deals_practice_group` (`practice_group`),
  INDEX `idx_deals_source_system` (`source_system`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Join table (no cross-db FK to lawyers.lawyers)
CREATE TABLE `deal_lawyers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `deal_id` INT NOT NULL,
  `lawyer_id` INT NOT NULL,
  `role` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_deal_lawyer` (`deal_id`, `lawyer_id`),
  INDEX `idx_deal_lawyers_deal_id` (`deal_id`),
  INDEX `idx_deal_lawyers_lawyer_id` (`lawyer_id`),
  FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DATABASE: awards
-- ============================================================
USE `awards`;

DROP TABLE IF EXISTS `award_lawyers`;
DROP TABLE IF EXISTS `awards`;

CREATE TABLE `awards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,

  -- existing core fields
  `award_name` VARCHAR(255) NOT NULL,
  `award_category` VARCHAR(255) NULL,
  `year` INT NULL,
  `description` TEXT NULL,
  `source_system` VARCHAR(100) DEFAULT 'admin',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_by_user_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- === Award variables from Data Table (2).xlsx ===
  `award_names` TEXT NULL,
  `award_pg` JSON NULL,
  `publications` TEXT NULL,
  `award_years` DATE NULL,

  INDEX `idx_awards_name` (`award_name`),
  INDEX `idx_awards_year` (`year`),
  INDEX `idx_awards_source_system` (`source_system`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Join table (no cross-db FK to lawyers.lawyers)
CREATE TABLE `award_lawyers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `award_id` INT NOT NULL,
  `lawyer_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_award_lawyer` (`award_id`, `lawyer_id`),
  INDEX `idx_award_lawyers_award_id` (`award_id`),
  INDEX `idx_award_lawyers_lawyer_id` (`lawyer_id`),
  FOREIGN KEY (`award_id`) REFERENCES `awards`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
