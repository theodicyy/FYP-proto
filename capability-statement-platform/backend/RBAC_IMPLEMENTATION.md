# RBAC Implementation - Step 7

## What Changed

### Database Schema
- **New Tables:**
  - `users` - User accounts with role_type (admin/associate)
  - `user_sessions` - Token-based authentication sessions
- **Updated Tables:**
  - `cap_statements` - Added `created_by_user_id` foreign key
  - `cap_statement_versions` - Added `created_by_user_id` foreign key
  - `templates`, `awards`, `deals`, `lawyers` - Added soft delete columns (`deleted_at`, `deleted_by_user_id`)

### Authentication System
- **New Files:**
  - `src/models/User.js` - User model with role checking methods
  - `src/repositories/userRepository.js` - User data access
  - `src/services/authService.js` - Authentication logic (login, token management)
  - `src/middlewares/auth.js` - Authentication middleware
  - `src/middlewares/rbac.js` - Role-based access control middleware
  - `src/controllers/authController.js` - Auth endpoints
  - `src/routes/auth.js` - Auth routes

### Updated Files
- **Routes:** All routes now have RBAC guards
  - `routes/templates.js` - Read: both, Write: admin only
  - `routes/lawyers.js` - Read: both, Write: admin only (to be implemented)
  - `routes/deals.js` - Read: both, Write: admin only (to be implemented)
  - `routes/awards.js` - Read: both, Write: admin only (to be implemented)
  - `routes/capStatements.js` - Generate/Create: both, Edit/Delete: ownership-based
- **Services:** Updated to filter by user ownership
  - `capStatementService.getStatements()` - Associates see only their own
  - `capStatementService.saveStatement()` - Records user ownership
- **Repositories:** Updated to support user filtering
  - `capStatementRepository.findAll()` - Filters by `created_by_user_id`

## Why It Changed

1. **Security First:** Server-side enforcement prevents unauthorized access
2. **Role Separation:** Clear distinction between Admin (Type 1) and Associate (Type 2) permissions
3. **Data Isolation:** Associates can only see/edit their own cap statements
4. **Audit Trail:** User ownership tracking for compliance

## Permission Matrix

| Resource | Action | Admin | Associate |
|----------|--------|-------|-----------|
| Templates | Read | ✅ | ✅ |
| Templates | Create/Update/Delete | ✅ | ❌ |
| Awards | Read | ✅ | ✅ |
| Awards | Create/Update/Delete | ✅ | ❌ |
| Deals | Read | ✅ | ✅ |
| Deals | Create/Update/Delete | ✅ | ❌ |
| Lawyers | Read | ✅ | ✅ |
| Lawyers | Create/Update/Delete | ✅ | ❌ |
| Cap Statements | Generate | ✅ | ✅ |
| Cap Statements | Create | ✅ | ✅ |
| Cap Statements | Read (own) | ✅ | ✅ |
| Cap Statements | Read (all) | ✅ | ❌ |
| Cap Statements | Edit (own) | ✅ | ✅ |
| Cap Statements | Edit (any) | ✅ | ❌ |
| Cap Statements | Delete (own) | ✅ | ✅ |
| Cap Statements | Delete (any) | ✅ | ❌ |

## Manual Test Checklist

### Prerequisites
1. Run database migration: `migration_rbac_simple.sql`
2. Restart backend server
3. Install dependencies if needed (no new packages required - using built-in crypto)

### Test 1: Authentication
- [ ] `POST /api/v1/auth/login` with `admin@lawfirm.com` / `admin123`
- [ ] Verify response contains `token` and `user` object
- [ ] Verify user role is `admin`
- [ ] `POST /api/v1/auth/login` with `associate@lawfirm.com` / `associate123`
- [ ] Verify user role is `associate`
- [ ] `GET /api/v1/auth/me` with Bearer token
- [ ] Verify returns current user info

### Test 2: Admin Access (Type 1)
- [ ] Login as admin, get token
- [ ] `GET /api/v1/templates` - Should return all templates
- [ ] `POST /api/v1/templates` - Should create template (admin only)
- [ ] `PUT /api/v1/templates/:id` - Should update template (admin only)
- [ ] `DELETE /api/v1/templates/:id` - Should delete template (admin only)
- [ ] `GET /api/v1/cap-statements` - Should return ALL statements
- [ ] `PUT /api/v1/cap-statements/:id` - Should edit ANY statement
- [ ] `DELETE /api/v1/cap-statements/:id` - Should delete ANY statement

### Test 3: Associate Access (Type 2)
- [ ] Login as associate, get token
- [ ] `GET /api/v1/templates` - Should return templates (read-only)
- [ ] `POST /api/v1/templates` - Should return 403 Forbidden
- [ ] `GET /api/v1/cap-statements` - Should return ONLY own statements
- [ ] `POST /api/v1/cap-statements/generate` - Should generate statement
- [ ] `POST /api/v1/cap-statements` - Should create statement (owned by associate)
- [ ] `PUT /api/v1/cap-statements/:id` (own) - Should update own statement
- [ ] `PUT /api/v1/cap-statements/:id` (other's) - Should return 403
- [ ] `DELETE /api/v1/cap-statements/:id` (own) - Should delete own statement
- [ ] `DELETE /api/v1/cap-statements/:id` (other's) - Should return 403

### Test 4: Unauthenticated Access
- [ ] `GET /api/v1/templates` - Should work (optional auth)
- [ ] `POST /api/v1/templates` - Should return 401 Unauthorized
- [ ] `GET /api/v1/cap-statements` - Should return 401 Unauthorized
- [ ] `POST /api/v1/cap-statements/generate` - Should return 401 Unauthorized

### Test 5: Token Validation
- [ ] Use expired/invalid token - Should return 401
- [ ] Use valid token - Should work
- [ ] `POST /api/v1/auth/logout` - Should invalidate token
- [ ] Use logged-out token - Should return 401

## Risk Assessment

### Low Risk
- ✅ Authentication middleware is isolated
- ✅ RBAC checks are explicit and logged
- ✅ No breaking changes to existing data structure
- ✅ Backward compatible (optional auth on read endpoints)

### Medium Risk
- ⚠️ Password hashing is simplified (SHA256) - should use bcrypt in production
- ⚠️ Token expiration is 7 days - may need adjustment
- ⚠️ No password reset flow yet

### Mitigation
- Password hashing can be upgraded to bcrypt without breaking changes
- Token expiration is configurable
- Password reset can be added incrementally

## Next Steps (Step 8)

After RBAC is verified:
1. Implement CRUD endpoints for reference data (awards, deals, lawyers)
2. Add soft delete functionality
3. Implement relationship management (award_lawyers, deal_lawyers)
4. Add versioning to cap statements

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (public)
- `POST /api/v1/auth/logout` - Logout (authenticated)
- `GET /api/v1/auth/me` - Get current user (authenticated)

### Usage Example

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lawfirm.com","password":"admin123"}'

# Use token in requests
curl -X GET http://localhost:3000/api/v1/cap-statements \
  -H "Authorization: Bearer <token>"
```

## Notes

- Default users are created with placeholder passwords - update in production
- Sessions are stored in database for auditability
- All permission checks are logged for security monitoring
- Frontend integration will come in Step 10 (Controlled Access UI)
