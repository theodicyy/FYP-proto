# Step 5 Testing Guide: Backend Controller & Routes

## What Was Created

1. **TemplateDefinitionController** (`backend/src/controllers/templateDefinitionController.js`)
   - HTTP request/response handling for template definitions
   - Uses TemplateDefinitionService
   - Includes error handling with proper status codes

2. **templateDefinitions Routes** (`backend/src/routes/templateDefinitions.js`)
   - REST API endpoints for template definitions
   - RBAC protection (Admin for structure, Associate/Admin for content)
   - Routes mounted in `/api/v1/template-definitions`

## API Endpoints

### Template Definition Endpoints:

- `GET /api/v1/template-definitions` - Get all template definitions
  - Query: `?includeInactive=true` (optional)
  - Access: Public (optional auth)
  
- `GET /api/v1/template-definitions/:id` - Get template definition by ID
  - Access: Public (optional auth)
  
- `GET /api/v1/template-definitions/name/:name` - Get template definition by name
  - Access: Public (optional auth)
  
- `GET /api/v1/template-definitions/:id/with-content` - Get template with all content
  - Access: Public (optional auth)
  
- `GET /api/v1/template-definitions/:id/content` - Get template content entries
  - Query: `?page_number=1&section_id=title-section&is_enabled=true` (optional)
  - Access: Public (optional auth)
  
- `POST /api/v1/template-definitions` - Create new template definition
  - Body: `{ name, description, template_type, total_pages, structure, styles }`
  - Access: Admin only
  
- `PUT /api/v1/template-definitions/:id` - Update template definition
  - Body: `{ name?, description?, template_type?, total_pages?, structure?, styles?, is_active? }`
  - Access: Admin only
  
- `DELETE /api/v1/template-definitions/:id` - Delete template definition (soft delete)
  - Access: Admin only

### Template Content Endpoints:

- `PUT /api/v1/template-definitions/:id/content` - Batch update content
  - Body: `{ updates: [{ page_number, section_id, element_id, content_value }, ...] }`
  - Access: Associate or Admin
  
- `PUT /api/v1/template-definitions/:id/content/:page/:section/:element` - Update single content
  - Body: `{ content_value: "..." }`
  - Access: Associate or Admin
  
- `PUT /api/v1/template-definitions/:id/content/:page/:section/:element/enabled` - Enable/disable content
  - Body: `{ enabled: true/false }`
  - Access: Admin only

## Testing Options

### Option 1: Syntax Check

Verify files load without syntax errors:

```bash
cd backend
node -e "import('./src/controllers/templateDefinitionController.js').then(() => console.log('✅ Controller syntax OK'))"
node -e "import('./src/routes/templateDefinitions.js').then(() => console.log('✅ Routes syntax OK'))"
```

### Option 2: Start Backend Server and Test

1. Start backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test endpoints with curl or Postman:

```bash
# Get all template definitions
curl http://localhost:3000/api/v1/template-definitions

# Get template definition by ID (replace 1 with actual ID)
curl http://localhost:3000/api/v1/template-definitions/1

# Get template definition by name
curl http://localhost:3000/api/v1/template-definitions/name/26-Page%20Proposal%20Template

# Get template with content
curl http://localhost:3000/api/v1/template-definitions/1/with-content

# Get template content
curl http://localhost:3000/api/v1/template-definitions/1/content

# Update content (requires auth token)
curl -X PUT http://localhost:3000/api/v1/template-definitions/1/content/1/title-section/title-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content_value": "PROPOSAL FOR ACME CORPORATION"}'
```

### Option 3: Verify Routes Are Mounted

Check that routes are registered in `backend/src/routes/index.js`:

```javascript
router.use('/template-definitions', templateDefinitionsRouter);
```

## Expected Behavior

### Success Response Format:
```json
{
  "success": true,
  "data": { ... },
  "count": 1  // For list endpoints
}
```

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

### Status Codes:
- 200: Success
- 201: Created
- 400: Validation error
- 404: Not found
- 403: Forbidden (RBAC)
- 500: Server error

## Next Steps

Once Step 5 is verified:
- ✅ Controller file exists and has correct syntax
- ✅ Routes file exists and has correct syntax
- ✅ Routes are mounted in index.js
- ✅ API endpoints respond correctly (if server is running)

Then proceed to **Step 8-12: Frontend Integration**

The backend API is now complete and ready for frontend integration.
