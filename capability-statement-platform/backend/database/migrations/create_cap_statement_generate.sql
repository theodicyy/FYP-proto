-- Migration: Replace cap_statements + cap_statement_versions with cap_statement_generate
-- This table stores all form inputs, selected IDs, and the generated DOCX as a BLOB.
-- Each row is a version. Rows sharing the same group_id form a version chain.

CREATE TABLE IF NOT EXISTS cap_statement_generate (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Grouping: all versions of the same statement share a group_id
  group_id VARCHAR(100) NOT NULL,
  version_number INT NOT NULL DEFAULT 1,

  -- Title & metadata
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'generated',
  created_by_user_id INT,

  -- All form inputs from /configuration (stored as JSON)
  manual_fields JSON,

  -- Selected entity IDs from /aggregation (stored as JSON)
  selected_ids JSON,

  -- Full entity objects for edit restore (stored as JSON)
  selected_entities JSON,

  -- Generated DOCX binary
  docx_blob LONGBLOB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  INDEX idx_group_id (group_id),
  INDEX idx_group_version (group_id, version_number)
) ENGINE=InnoDB;
