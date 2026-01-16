# Implementation Notes: Template-Driven Generation & Editing

## What Was Implemented

### 1. Template-Driven Cap Statement Generation ✅

**Database Changes:**
- Created `templates` table with `id`, `name`, `description`, `content`
- Added sample templates with placeholders: `{{lawyers}}`, `{{deals}}`, `{{awards}}`, `{{date}}`
- Updated `cap_statements` table to include:
  - `template_id` (foreign key to templates)
  - `generated_content` (immutable, original generated content)
  - `edited_content` (mutable, human edits)

**Backend:**
- `TemplateRepository` - CRUD operations for templates
- `TemplateService` - Business logic with placeholder replacement
- `TemplateController` - HTTP handlers
- Updated `CapStatementService` to:
  - Accept `templateId` in generation request
  - Load template and populate placeholders deterministically
  - Store `generated_content` as immutable
  - Store `edited_content` separately

**Frontend:**
- Template selection dropdown in Configuration page
- Templates loaded from API on page mount
- Generation uses selected template

### 2. CRUD for Generated Cap Statements ✅

**Backend:**
- `PUT /api/v1/cap-statements/:id` - Update statement (title, description, edited_content, status)
- `DELETE /api/v1/cap-statements/:id` - Delete statement
- `GET /api/v1/cap-statements/:id` - Returns statement with `display_content` (edited if exists, else generated)

**Data Model:**
- `generated_content` - Never modified after creation
- `edited_content` - Stores all human edits
- `display_content` - Computed field (edited_content || generated_content)

### 3. Human-in-the-Loop Editing ✅

**UI Behavior:**
- **View Mode**: Read-only display of content
- **Edit Button**: Switches to edit mode
- **Edit Mode**: Large textarea for free-form editing
- **Save Button**: Persists `edited_content` to database
- **Cancel Button**: Reverts to last saved state

**Rules Enforced:**
- No auto-saving (explicit save required)
- No AI rewriting during edit
- Human-controlled only
- `generated_content` remains immutable
- All edits go to `edited_content`

**Implementation:**
- `Preview.vue` - Edit button, textarea, save/cancel
- `Library.vue` - Edit functionality for saved statements
- `capStatementStore` - State management for editing mode
- Backend update endpoint persists `edited_content`

## Database Migration

Run this SQL file to add templates and update schema:

```bash
mysql -u root -p capability_statement_db < backend/database/migration_templates_and_editing.sql
```

Or import via phpMyAdmin:
1. Select `capability_statement_db`
2. Import tab → Choose `migration_templates_and_editing.sql`
3. Click Go

## API Endpoints

### Templates
- `GET /api/v1/templates` - List all templates
- `GET /api/v1/templates/:id` - Get template by ID
- `POST /api/v1/templates` - Create template
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

### Cap Statements
- `POST /api/v1/cap-statements/generate` - Generate with template
  ```json
  {
    "templateId": 1,
    "dealIds": [1, 2],
    "awardIds": [1],
    "lawyerIds": [1, 2],
    "settings": {}
  }
  ```
- `POST /api/v1/cap-statements` - Save new statement
- `GET /api/v1/cap-statements` - List statements
- `GET /api/v1/cap-statements/:id` - Get statement (returns `display_content`)
- `PUT /api/v1/cap-statements/:id` - Update statement
  ```json
  {
    "edited_content": "Updated content...",
    "status": "edited"
  }
  ```
- `DELETE /api/v1/cap-statements/:id` - Delete statement

## Testing Checklist

### Step 1: Template Generation
- [ ] Run database migration
- [ ] Select template in Configuration page
- [ ] Select lawyers, deals, awards
- [ ] Generate statement
- [ ] Verify placeholders are replaced correctly
- [ ] Verify `generated_content` is stored

### Step 2: CRUD Operations
- [ ] Save generated statement
- [ ] View statement in Library
- [ ] Update statement (change title, description)
- [ ] Delete statement
- [ ] Verify persistence after refresh

### Step 3: Editing
- [ ] Click "Edit" button on Preview page
- [ ] Make changes in textarea
- [ ] Click "Save Edits"
- [ ] Verify `edited_content` is saved
- [ ] Verify `generated_content` is unchanged
- [ ] Click "Cancel" and verify revert
- [ ] Edit saved statement in Library
- [ ] Verify edits persist after refresh

## Key Design Decisions

1. **Immutable Generated Content**: `generated_content` never changes, preserving original template output
2. **Separate Edit Field**: `edited_content` stores all human modifications
3. **Display Logic**: Always show `edited_content` if it exists, otherwise `generated_content`
4. **No Auto-Save**: Explicit save required to prevent accidental changes
5. **Deterministic Generation**: Template placeholders replaced with formatted data, no LLM
6. **Template as Source of Truth**: Templates define structure, data fills placeholders

## Future Enhancements

- Template preview before selection
- Template editor UI
- Version comparison (generated vs edited)
- Export edited vs generated
- Template variables/conditional sections
- Rich text editor for editing mode
