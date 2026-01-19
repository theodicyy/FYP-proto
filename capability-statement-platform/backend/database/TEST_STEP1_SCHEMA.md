# Step 1 Testing Guide: Database Schema

## What Was Created

Three new tables for storing 26-page template structure and content:

1. **`template_definitions`** - Stores immutable template structure (JSON schema)
2. **`template_content`** - Stores editable content values
3. **`template_versions`** - Stores version history for template definitions

## How to Test

### 1. Run the Migration

Open phpMyAdmin:
1. Select your database: `capability_statement_db`
2. Go to SQL tab
3. Copy and paste the entire contents of `migration_26page_template_storage.sql`
4. Click "Go"

### 2. Verify Tables Exist

Run this query:
```sql
SELECT TABLE_NAME, TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'capability_statement_db' 
    AND TABLE_NAME IN ('template_definitions', 'template_content', 'template_versions');
```

**Expected Result:** 3 rows showing the 3 tables

### 3. Verify Table Structures

Run these queries:
```sql
DESCRIBE template_definitions;
DESCRIBE template_content;
DESCRIBE template_versions;
```

**Expected:** Each should show column definitions with correct types

### 4. Verify Foreign Keys

Run this query:
```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'capability_statement_db'
    AND TABLE_NAME IN ('template_content', 'template_versions')
    AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Expected:** Should show foreign key relationships

### 5. Verify Indexes

Run this query:
```sql
SHOW INDEX FROM template_definitions;
SHOW INDEX FROM template_content;
SHOW INDEX FROM template_versions;
```

**Expected:** Should show multiple indexes per table

## Success Criteria

✅ All 3 tables created  
✅ No SQL errors (except "table already exists" if re-running)  
✅ Foreign keys exist  
✅ Indexes created  
✅ Unique constraint on template_content exists  

## Common Issues

**Error: "Table 'capability_statement_db.users' doesn't exist"**
- The `template_versions` table references `users` table
- If this error occurs, the `users` table needs to be created first (from RBAC migration)
- You can temporarily comment out the foreign key if users table doesn't exist yet

**Error: "Table already exists"**
- This is fine - tables are already created
- Use `DROP TABLE` if you need to recreate (be careful with data)

## Next Steps

Once Step 1 is verified:
- ✅ Tables exist and have correct structure
- ✅ No critical errors

Then proceed to **Step 2: Extract Page1Cover to JSON Schema**
