# Step 1 Testing - Simple Approach

## Quick Test

Run this simple query first to check if tables exist:

```sql
USE capability_statement_db;
SHOW TABLES LIKE 'template_%';
```

**Expected Result:** Should show 3 tables:
- template_definitions
- template_content  
- template_versions

## If Tables Don't Exist

1. Make sure you ran the **CREATE TABLE** statements first
2. The migration file has 3 CREATE TABLE statements at the top
3. Run them one at a time if needed:

```sql
-- Run this first
USE capability_statement_db;

CREATE TABLE IF NOT EXISTS template_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type ENUM('simple', 'multipage') DEFAULT 'simple',
    total_pages INT DEFAULT 1,
    structure_json LONGTEXT NOT NULL,
    styles_json LONGTEXT,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (template_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Then run the other CREATE TABLE statements.

## If You Get Foreign Key Errors

If you see errors about `users` table:
- The `template_versions` table tries to reference `users` table
- This is OK - we'll add that foreign key later if needed
- For now, the tables will still work without that foreign key

## Success Criteria

✅ Running `SHOW TABLES LIKE 'template_%'` shows 3 tables
✅ No critical errors when creating tables
✅ You can DESCRIBE each table successfully

Once you see the 3 tables, Step 1 is complete!
