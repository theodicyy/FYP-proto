# 26-Page Template Editor Refactor with Dynamic Placeholders

## Implementation Summary

This document summarizes the refactoring of the 26-page template editor to support dynamic placeholders while maintaining the existing inline editing UI.

## ✅ Completed Features

### 1. Dynamic Placeholder Parsing Utility

**File**: `frontend/src/utils/placeholderParser.js`

- Created utility functions to recognize and validate placeholders: `{{lawyers}}`, `{{deals}}`, `{{awards}}`, `{{date}}`
- Functions include:
  - `extractPlaceholders()` - Extract all placeholders from content
  - `isValidPlaceholder()` - Validate placeholder format
  - `replacePlaceholdersInHTML()` - Replace placeholders in HTML content
  - `replacePlaceholdersInText()` - Replace placeholders in plain text
  - `hasPlaceholders()` - Check if content contains placeholders

### 2. Template Editor Refactor

**Files Modified**:
- `frontend/src/views/admin/TemplatesManagement.vue`
- `frontend/src/components/InlineDocumentEditor.vue`

**Key Changes**:
- ✅ Maintained existing inline editing UI (Google Docs-style)
- ✅ Full persistence: Edits save to database, reload restores all pages and edits
- ✅ Support for inline editing of text, tables, and images
- ✅ Placeholders are naturally preserved by TipTap editor (treated as plain text)

### 3. "+ Add Template" Flow Refactor

**Changes**:
- Changed "+ Add Template" button to create a new template definition and open the inline editor (blank canvas)
- No longer shows form modal for structured templates
- New templates start with one blank page
- Users can immediately start editing with the full toolbar

**Implementation**:
- `createNewTemplate()` function creates a new `template_definition` entry
- Opens `InlineDocumentEditor` with the new template ID
- Template name can be edited inline in the editor header
- Template name updates when user clicks "Confirm"

### 4. Template Name Editing

- Added inline template name editing in the editor header
- Name field is editable and updates on blur or on save
- Name updates are saved along with document content

### 5. Persistence

**Already Working**:
- Document JSON structure is saved to `template_content` table
- Uses special identifiers: `section_id='document'`, `element_id='full_content'`, `page_number=1`
- Document structure includes:
  - Page structure
  - HTML content per page
  - Tables, images, formatting preserved
  - Placeholders preserved as text

**Load Flow**:
- Editor automatically loads existing document content when opened
- `loadExistingDocument()` fetches document JSON from backend
- Reconstructs TipTap editor instances with saved content

## Placeholder Support Details

### Supported Placeholders

1. **{{lawyers}}** - Replaced with formatted lawyers list
2. **{{deals}}** - Replaced with formatted deals list  
3. **{{awards}}** - Replaced with formatted awards list
4. **{{date}}** - Replaced with current date

### How Placeholders Work

1. **In Editor**: Placeholders are treated as plain text by TipTap
   - Users can type them directly: `{{lawyers}}`, `{{deals}}`, etc.
   - Placeholders are preserved during editing, formatting, and saving
   - No special handling needed in the editor

2. **In Database**: Placeholders are stored as part of the HTML content
   - Saved in the document JSON structure
   - Preserved exactly as typed by the user

3. **In Generation** (Future Enhancement):
   - Backend has placeholder replacement logic in `templateService.js`
   - Currently works with plain text templates
   - For JSON-based templates, would need to:
     - Extract HTML from each page
     - Replace placeholders in HTML
     - Reconstruct document structure
   - This is a future enhancement for capability statement generation

## File Structure

```
frontend/
├── src/
│   ├── utils/
│   │   └── placeholderParser.js          # Placeholder parsing utilities
│   ├── views/admin/
│   │   └── TemplatesManagement.vue       # Main template management UI
│   └── components/
│       └── InlineDocumentEditor.vue      # Inline editor component
```

## Usage Examples

### Creating a New Template

1. Click "+ Add Template" button
2. Editor opens with blank canvas
3. Type content including placeholders:
   ```
   Our Team:
   {{lawyers}}
   
   Recent Deals:
   {{deals}}
   
   Awards:
   {{awards}}
   
   Date: {{date}}
   ```
4. Add formatting, tables, images as needed
5. Click "Confirm" to save
6. Template is saved with all content and placeholders preserved

### Editing Existing Template

1. Click "Edit Content" on a structured template
2. Editor opens with existing content loaded
3. Make edits, add placeholders, format text
4. Click "Confirm" to save changes
5. All edits and placeholders are preserved

### Template Name Editing

1. When editor is open, template name appears in header
2. Click on name to edit inline
3. Name updates automatically on blur or on "Confirm" click

## Backend Integration

### Template Definition Creation

**Endpoint**: `POST /api/v1/template-definitions`

**Request Body**:
```json
{
  "name": "New Template",
  "description": "",
  "template_type": "multipage",
  "total_pages": 1,
  "structure": "{\"pages\":[{\"id\":\"page-1\",\"sections\":[]}]}",
  "styles": null
}
```

### Template Content Storage

**Endpoint**: `PUT /api/v1/template-definitions/:id/content/upsert`

**Request Body**:
```json
{
  "page_number": 1,
  "section_id": "document",
  "element_id": "full_content",
  "content_value": "{...document JSON...}",
  "content_type": "html"
}
```

## Notes

1. **Placeholder Replacement**: The backend placeholder replacement logic currently works with plain text templates. For the new JSON-based template format, placeholder replacement would need to be enhanced to work with the document JSON structure. This is a future enhancement.

2. **Backward Compatibility**: Simple text templates (old format) continue to work as before. The new editor is only for structured template definitions.

3. **Placeholder Format**: Placeholders must use exact format: `{{lawyers}}`, `{{deals}}`, `{{awards}}`, `{{date}}` (double curly braces, lowercase).

## Testing Checklist

- [x] Create new template opens blank canvas editor
- [x] Typing placeholders preserves them in editor
- [x] Saving template persists placeholders correctly
- [x] Loading template restores placeholders
- [x] Template name editing works
- [x] Multiple pages supported
- [x] Tables, images, formatting preserved
- [x] Editor toolbar functions correctly

## Future Enhancements

1. **Placeholder Replacement for JSON Templates**: Enhance backend to replace placeholders in JSON-based template structure
2. **Placeholder Validation**: Add visual indicators or validation for placeholders in editor
3. **Placeholder Autocomplete**: Suggest placeholders as user types
4. **Preview with Placeholder Replacement**: Show preview with placeholders replaced in real-time
