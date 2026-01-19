# Step 4 Testing Guide: Backend Service Layer

## What Was Created

**TemplateDefinitionService** (`backend/src/services/templateDefinitionService.js`)
- Business logic layer for structured template definitions
- Uses TemplateDefinitionRepository and TemplateContentRepository
- Includes validation, error handling, and logging
- Methods for CRUD operations on templates and content

## Key Methods

### Template Definition Methods:
- `getTemplateDefinitions(includeInactive)` - Get all templates
- `getTemplateDefinitionById(id)` - Get template by ID
- `getTemplateDefinitionByName(name)` - Get template by name
- `getTemplateDefinitionWithContent(id)` - Get template with all content entries
- `createTemplateDefinition(data)` - Create new template
- `updateTemplateDefinition(id, data, userId)` - Update template (creates version if structure changes)
- `deleteTemplateDefinition(id)` - Soft delete template

### Template Content Methods:
- `getTemplateContent(templateDefinitionId, filters)` - Get content entries
- `updateTemplateContent(templateId, page, section, element, value)` - Update single content
- `updateTemplateContentBatch(templateId, updates)` - Batch update content
- `setTemplateContentEnabled(templateId, page, section, element, enabled)` - Enable/disable content

## Testing Options

### Option 1: Syntax Check

Verify the service file loads without syntax errors:

```bash
cd backend
node -e "import('./src/services/templateDefinitionService.js').then(() => console.log('✅ TemplateDefinitionService syntax OK')).catch(e => console.error('❌ Syntax error:', e.message))"
```

### Option 2: Test via API (After Step 5)

Once controllers and routes are implemented (Step 5), test via HTTP requests.

### Option 3: Code Review

Verify the service:
- ✅ Imports both repositories correctly
- ✅ Has all expected methods
- ✅ Includes validation (400 errors)
- ✅ Includes error handling (404, 500 errors)
- ✅ Has logging statements
- ✅ Follows same patterns as other services

## Expected Service Behavior

### Validation:
- `createTemplateDefinition()` requires `name` and `structure`
- `updateTemplateContentBatch()` validates array format
- All methods check if template exists before operations

### Error Handling:
- Returns 404 for not found
- Returns 400 for validation errors
- Returns 500 for unexpected errors
- All errors are logged

### Logging:
- All operations are logged with relevant context
- Logs include IDs, names, counts, etc.

## Next Steps

Once Step 4 is verified:
- ✅ Service file exists and has correct syntax
- ✅ Methods follow expected patterns
- ✅ Validation and error handling present

Then proceed to **Step 5: Backend Controller & Routes**

The controller layer will use this service, so if the service is correct, the API endpoints should work.
