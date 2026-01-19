# Migration: Add Version Name Support

## Step 1: Run Database Migration

Run the SQL migration to add the `version_name` column:

```sql
-- Run this in phpMyAdmin or MySQL client
ALTER TABLE cap_statement_versions 
ADD COLUMN version_name VARCHAR(255) NULL 
AFTER version_number;

-- Optional: Add index for faster lookups
CREATE INDEX idx_version_name ON cap_statement_versions(version_name);
```

Or use the migration file:
`/capability-statement-platform/backend/database/migration_add_version_name.sql`

## Step 2: Restart Backend Server

After running the migration, restart your backend server to pick up the schema changes.

## What's Changed

1. **Database**: Added `version_name` column to `cap_statement_versions` table
2. **Backend**: Updated repository, service, and controller to handle version names
3. **Frontend**: Added UI for displaying and renaming versions

## Features

- Versions can now have custom names (optional)
- Default display: "Version X (date)" if no custom name
- Custom name display: "Custom Name (vX)" if name is set
- Rename button appears next to version selector
- Rename modal allows setting/clearing version names
