# RBAC Testing Guide

## Quick Start Testing

### 1. Run Database Migration

In phpMyAdmin, run `migration_rbac_simple.sql` step by step, or use the SQL tab:

```sql
-- Copy and paste each section from migration_rbac_simple.sql
```

### 2. Test Authentication

#### Login as Admin
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lawfirm.com","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@lawfirm.com",
      "firstName": "Admin",
      "lastName": "User",
      "roleType": "admin"
    },
    "token": "abc123...",
    "expiresAt": "..."
  }
}
```

#### Login as Associate
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"associate@lawfirm.com","password":"associate123"}'
```

### 3. Test RBAC Enforcement

#### Admin can create template
```bash
TOKEN="<admin_token_from_login>"

curl -X POST http://localhost:3000/api/v1/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "content": "Test {{lawyers}}"
  }'
```

#### Associate cannot create template (should get 403)
```bash
TOKEN="<associate_token_from_login>"

curl -X POST http://localhost:3000/api/v1/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "content": "Test"
  }'
```

Expected: `{"success": false, "error": {"message": "Only admins can create templates"}}`

#### Associate can generate cap statement
```bash
TOKEN="<associate_token>"

curl -X POST http://localhost:3000/api/v1/cap-statements/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": 1,
    "dealIds": [1],
    "awardIds": [1],
    "lawyerIds": [1]
  }'
```

### 4. Test Ownership Filtering

#### Create statement as Associate
```bash
TOKEN="<associate_token>"

curl -X POST http://localhost:3000/api/v1/cap-statements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Statement",
    "content": "Test content",
    "dealIds": [],
    "awardIds": [],
    "lawyerIds": []
  }'
```

Note the returned `id` (e.g., 5)

#### Associate lists statements (should only see own)
```bash
TOKEN="<associate_token>"

curl -X GET http://localhost:3000/api/v1/cap-statements \
  -H "Authorization: Bearer $TOKEN"
```

Should only return statements where `created_by_user_id` matches associate's user ID.

#### Admin lists statements (should see all)
```bash
TOKEN="<admin_token>"

curl -X GET http://localhost:3000/api/v1/cap-statements \
  -H "Authorization: Bearer $TOKEN"
```

Should return ALL statements.

#### Associate tries to edit another's statement (should fail)
```bash
TOKEN="<associate_token>"
STATEMENT_ID="<id_of_statement_created_by_admin>"

curl -X PUT http://localhost:3000/api/v1/cap-statements/$STATEMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "edited_content": "Hacked content"
  }'
```

Expected: `{"success": false, "error": {"message": "You can only edit your own capability statements"}}`

## Verification Checklist

- [ ] Admin can login
- [ ] Associate can login
- [ ] Admin can create/update/delete templates
- [ ] Associate cannot create/update/delete templates (403)
- [ ] Both can read templates
- [ ] Both can generate cap statements
- [ ] Associate only sees own statements in list
- [ ] Admin sees all statements in list
- [ ] Associate can edit own statements
- [ ] Associate cannot edit others' statements (403)
- [ ] Admin can edit any statement
- [ ] Unauthenticated requests to protected endpoints return 401

## Troubleshooting

### "Authentication required" errors
- Check token is being sent: `Authorization: Bearer <token>`
- Verify token hasn't expired (7 days)
- Check user session exists in database

### "Admin access required" errors
- Verify user role_type is 'admin' in database
- Check token belongs to admin user

### "You can only edit your own" errors
- Verify `created_by_user_id` matches current user ID
- Check statement exists and has correct ownership

### Password not working
- Default passwords: `admin123` and `associate123`
- Password hash uses salt: `default_salt_change_in_production`
- To reset: Update `password_hash` in database using same hashing method
