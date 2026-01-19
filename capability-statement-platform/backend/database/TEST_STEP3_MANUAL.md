# Manual Testing Guide for Step 3: Repository Layer

## Prerequisites

✅ Ensure your `.env` file has correct database settings:
```
DB_HOST=localhost
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=capability_statement_db
```

✅ Backend server should be able to connect to MySQL (verify with existing endpoints)

## Testing Options

### Option 1: Quick Syntax Check

The repositories are pure JavaScript files. You can verify they load without syntax errors:

```bash
cd backend
node -e "import('./src/repositories/templateDefinitionRepository.js').then(() => console.log('✅ TemplateDefinitionRepository loaded')).catch(e => console.error('❌ Error:', e.message))"
node -e "import('./src/repositories/templateContentRepository.js').then(() => console.log('✅ TemplateContentRepository loaded')).catch(e => console.error('❌ Error:', e.message))"
```

### Option 2: Test via Backend API (After Step 4-5)

Once controllers and routes are implemented, test via HTTP requests:
- GET `/api/v1/template-definitions`
- GET `/api/v1/template-definitions/:id`
- GET `/api/v1/template-definitions/:id/content`
- PUT `/api/v1/template-definitions/:id/content`

### Option 3: SQL Verification

Verify the repositories can read data by checking the tables directly in phpMyAdmin:

```sql
-- Verify template_definitions table structure matches repository expectations
SELECT 
    id, name, template_type, total_pages, version, is_active,
    LENGTH(structure_json) as structure_length,
    LENGTH(styles_json) as styles_length
FROM template_definitions
WHERE name = '26-Page Proposal Template';

-- Verify template_content table structure matches repository expectations
SELECT 
    template_definition_id, page_number, section_id, element_id,
    content_type, content_value, is_enabled
FROM template_content
WHERE template_definition_id = (
    SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1
)
ORDER BY page_number, section_id, element_id;
```

### Option 4: Verify Code Structure

Review the repository files to ensure:

1. **TemplateDefinitionRepository** (`src/repositories/templateDefinitionRepository.js`):
   - ✅ Has `findAll()`, `findById()`, `findByName()` methods
   - ✅ Has `create()`, `update()`, `delete()` methods
   - ✅ Parses `structure_json` and `styles_json` to objects
   - ✅ Handles version increments on structure changes

2. **TemplateContentRepository** (`src/repositories/templateContentRepository.js`):
   - ✅ Has `findByTemplateId()`, `findOne()` methods
   - ✅ Has `upsert()`, `updateContent()`, `updateBatch()` methods
   - ✅ Has `setEnabled()`, `delete()` methods

## Expected Repository Behavior

### TemplateDefinitionRepository.findByName()
- Should return template object with parsed `structure` and `styles` properties
- `structure` should be a JavaScript object (not a string)
- `styles` should be an object or null

### TemplateContentRepository.findByTemplateId()
- Should return array of content entries
- Each entry should have: `template_definition_id`, `page_number`, `section_id`, `element_id`, `content_value`, `is_enabled`

### TemplateContentRepository.updateContent()
- Should update `content_value` for specific content entry
- Should return `true` if update succeeded

## Next Steps

Once you've verified:
- ✅ Repository files exist and have no syntax errors
- ✅ Code structure matches expected methods
- ✅ Database tables exist with correct structure

Then proceed to **Step 4: Backend Service Layer**

The service layer will use these repositories, so if repositories are correct, services should work too.
