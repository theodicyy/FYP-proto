# 26-Page Template Migration Plan

## Architecture Overview

### Current State
- Template structure: Vue components in `/frontend/src/components/pages/`
- Template content: N/A (hardcoded in components)
- Storage: Database has placeholder entries only

### Target State
- Template structure: JSON schema stored in `template_definitions` table (immutable)
- Template content: Editable fields stored in `template_content` table
- Frontend: Only fetches and renders templates from backend
- Backend: Generates final documents by merging structure + content

## Database Schema

### `template_definitions` Table
- Stores immutable template structure as JSON
- Fields: id, name, description, template_type, total_pages, structure_json, styles_json, version, is_active
- Structure JSON contains: pages array, each with sections, elements, positioning, styling rules

### `template_content` Table
- Stores editable content values
- Fields: id, template_definition_id, page_number, section_id, element_id, content_type, content_value, is_enabled
- Allows content-level edits without structure changes

### `template_versions` Table
- Tracks version history for template definitions
- Enables rollback to previous structure versions

## JSON Structure Schema

Example structure for Page 1:

```json
{
  "pages": [
    {
      "pageNumber": 1,
      "pageType": "cover",
      "sections": [
        {
          "sectionId": "logo-top",
          "elementType": "image",
          "position": { "top": "25mm", "left": "25mm" },
          "contentKey": "logo-top-image",
          "styles": { "maxWidth": "120mm" }
        },
        {
          "sectionId": "title-section",
          "elementType": "text",
          "position": { "top": "240mm", "left": "35mm" },
          "contentKey": "title-text",
          "styles": { "fontSize": "32pt", "color": "#008080" }
        }
      ]
    }
  ]
}
```

## Implementation Steps

1. ✅ Create database schema
2. Extract Page1Cover structure to JSON
3. Create backend repository layer
4. Create backend service layer with CRUD
5. Create backend API endpoints
6. Create frontend template fetcher
7. Create frontend template renderer
8. Create frontend content editor
9. Remove frontend template creation logic
10. Update Templates Management UI

## Key Constraints

- Structure is IMMUTABLE (can only be changed via backend code/deployment)
- Content is EDITABLE (users can edit text, enable/disable sections)
- No structural changes from UI (can't add/remove pages, sections, elements)
- Preserve exact layout, styling, positioning from original Vue components
