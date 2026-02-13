# Capability Statement Platform - Technical Documentation

**Version:** Production  
**Last Updated:** 2026-02-13

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Template Variable Mapping](#template-variable-mapping)
3. [API Reference](#api-reference)
4. [Document Generation](#document-generation)
5. [Database Schema](#database-schema)
6. [Setup & Configuration](#setup--configuration)
7. [Key Technical Details](#key-technical-details)

---

## Architecture Overview

### Tech Stack
- **Backend:** Node.js + Express.js + MySQL
- **Frontend:** Vue 3 (Composition API) + Pinia + TipTap + Tailwind CSS
- **Document Generation:** Docxtemplater + PizZip

### Project Structure
```
/capability-statement-platform
  /backend
    /src
      /config          - Database configuration
      /routes          - API route definitions
      /controllers     - Request handlers
      /services        - Business logic layer
        - capStatementService.js  - Document payload builder
        - docGenerator.js          - Docxtemplater wrapper
      /repositories    - Data access layer
      /middlewares     - Auth, RBAC, error handling
      /utils           - Logger, utilities
    /database          - SQL schema (single file)
    /public/uploads    - Uploaded images
    /public/generated  - Generated DOCX files
    /src/template      - Word template file
  /frontend
    /src
      /components      - Reusable Vue components
      /views           - Page components
      /stores          - Pinia state stores
      /services        - API service layer
      /router          - Vue Router configuration
```

### Data Flow
1. **Frontend** → User selects lawyers/deals/awards + manual fields
2. **API** → `POST /api/v1/cap-statements/generate`
3. **Controller** → `capStatementController.generateStatement()`
4. **Service** → `capStatementService.buildTemplatePayload()` builds data payload
5. **Generator** → `docGenerator.generate()` renders Word document
6. **Response** → DOCX buffer returned to frontend

---

## Template Variable Mapping

### Footer (All Pages)

**Format:** `proposal for - {company name} - {tender_number}`

| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{client_name}` | Form: `manualFields.client_name` | Direct | Required |
| `{tender_number}` | Form: `manualFields.tender_number` | Direct | Optional |
| `{footer_proposal_text}` | Computed | "proposal for - {name} - {tender}" | Combined format |
| `{footer_text}` | Alias | Same as above | Compatibility |
| `{footer_client_name}` | Form | Direct | Separate field |
| `{footer_tender_number}` | Form | Direct | Separate field |

**Implementation:** Footer placeholders are automatically propagated to all footer sections (footer1.xml through footer19.xml) to ensure consistency across all pages.

---

### Lawyers (Pages 5, 6, 21, 22)

#### Basic Information
| Placeholder | Source | Database Field | Notes |
|------------|--------|---------------|-------|
| `{lawyer1}` | Database | `lawyers.first_name + last_name` | Full name |
| `{lawyer1_full_name}` | Database | `lawyers.first_name + last_name` | Primary field |
| `{lawyer1_name}` | Database | Alias | Same as above |
| `{lawyer_desc1}` | Database | `lawyers.lawyer_designation` OR `title + practice_group` | 2-3 word summary |
| `{lawyer1_title}` | Database | `lawyers.title` | Job title |
| `{lawyer1_designation}` | Database | `lawyers.designation` | Designation |
| `{lawyer1_practice_group}` | Database | `lawyers.practice_group` | Practice area |
| `{lawyer1_bio}` | Database | `lawyers.bio` | Biography |
| `{lawyer1_years_experience}` | Database | `lawyers.years_experience` | Number |

#### Qualifications & Admissions (Pages 5 & 6)
| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{lawyer1_qualifications}` | Database | `lawyers.qualifications` | Direct |
| `{lawyer1_admissions}` | Database | `lawyers.admissions` | Direct |
| `{lawyer1_qualifications_admissions}` | Database | Combined | "qual, qual, admission" |
| `{lawyer1_pg5_qual_adm}` | Database | Combined | For Pages 5 & 6 |
| `{lawyer1_pg5_bio}` | Database | `lawyers.bio` | For Pages 5 & 6 |

**Supports up to 4 lawyers:** `lawyer1`, `lawyer2`, `lawyer3`, `lawyer4` (same fields)

---

### Partners

| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{lead_partners}` | Database | "Name1, Name2" | First 2 lawyers |
| `{partner1}` | Database | Full name | First lawyer |
| `{partner2}` | Database | Full name | Second lawyer |
| `{partner3}` | Database | Full name | Third lawyer |
| `{partner4}` | Database | Full name | Fourth lawyer |

---

### Awards (Page 14)

| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{awards_list}` | Database | "Award – Org (Year)\n..." | One per line |
| `{awards_narrative}` | Database | "Award by Org (Year) - Category. Description." | Human-readable prose |
| `{award_pg1}` | Database | First award narrative | Page-specific |
| `{award_pg2}` | Database | Second award narrative | Page-specific |
| `{award_pg3}` | Database | Third award narrative | Page-specific |
| `{most_rel_award}` | Database | First award | Default |

**Example:**
- `awards_list`: "Best Law Firm 2024 – Legal Awards (2024)\nExcellence in M&A – Corporate Law (2023)"
- `awards_narrative`: "Best Law Firm 2024 by Legal Awards (2024) - Corporate Law. Recognized for excellence."

---

### Deals

| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{previous_summary}` | Database | All deal summaries | Joined with newlines |
| `{previous_transactions}` | Database | Alias | Same as above |
| `{previous_client1}` | Database | First deal client | Direct |
| `{previous_client2}` | Database | Second deal client | Direct |

---

### Client Information

| Placeholder | Source | Format | Notes |
|------------|--------|--------|-------|
| `{client_name}` | Form | Direct | Required |
| `{client_shortname}` | Form | Direct | Optional |
| `{tender_number}` | Form | Direct | Optional |
| `{date}` | Form | Direct | Optional |

---

## API Reference

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: Configure via `CORS_ORIGINS` env var

### Authentication
- **Method:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Endpoints:** All except `/health` and `/auth/login`

### Endpoints

#### Capability Statements
```
POST   /cap-statements/generate     Generate DOCX document
GET    /cap-statements              List statements
POST   /cap-statements              Create statement
GET    /cap-statements/:id          Get statement with versions
PUT    /cap-statements/:id          Update statement
DELETE /cap-statements/:id          Delete statement
POST   /cap-statements/:id/versions Create version
PUT    /cap-statements/:id/versions/:versionId Update version
```

#### Reference Data (Admin write, Associate read)
```
GET    /lawyers                     List lawyers
POST   /lawyers                     Create lawyer (Admin)
PUT    /lawyers/:id                 Update lawyer (Admin)
DELETE /lawyers/:id                 Delete lawyer (Admin)

GET    /deals                       List deals
POST   /deals                       Create deal (Admin)
PUT    /deals/:id                   Update deal (Admin)
DELETE /deals/:id                   Delete deal (Admin)

GET    /awards                      List awards
POST   /awards                      Create award (Admin)
PUT    /awards/:id                  Update award (Admin)
DELETE /awards/:id                  Delete award (Admin)
```

#### Templates
```
GET    /templates                   List templates
POST   /templates                   Create template
GET    /template-definitions        List template definitions
POST   /template-definitions        Create template definition
```

#### Authentication
```
POST   /auth/login                  Login (returns JWT)
GET    /auth/me                     Get current user
```

---

## Document Generation

### Generation Flow

1. **Payload Construction** (`capStatementService.buildTemplatePayload()`)
   - Extracts manual fields (client_name, tender_number, etc.)
   - Queries database for selected lawyers, deals, awards
   - Formats data for template placeholders
   - Applies null-safe fallbacks

2. **Document Rendering** (`docGenerator.generate()`)
   - Loads Word template (`Cap Statement Template V1.docx`)
   - Propagates footer placeholders to all footer sections
   - Removes yellow highlighting from footers
   - Renders document with Docxtemplater
   - Returns DOCX buffer

3. **Response**
   - Sets Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Sets Content-Disposition: `attachment; filename="Capability_Statement.docx"`
   - Sends buffer to client

### Footer Propagation

The system automatically ensures footer consistency:
- Finds footer file with placeholders (usually `footer3.xml`)
- Removes yellow highlighting
- Copies cleaned footer to all other footer files
- Ensures footer appears on all pages

### Template Requirements

- **Location:** `backend/src/template/Cap Statement Template V1.docx`
- **Format:** Standard `.docx` file
- **Placeholders:** Use `{placeholder_name}` syntax
- **Footer:** Placeholders in footer3.xml will be propagated to all pages

---

## Database Schema

### Core Tables

#### `lawyers`
- `id`, `first_name`, `last_name`, `email`
- `practice_group`, `title`, `designation`, `lawyer_designation`
- `qualifications`, `admissions`, `bio`, `years_experience`

#### `deals`
- `id`, `deal_name`, `client_name`, `deal_summary`
- `deal_value`, `currency`, `jurisdiction`, `deal_date`

#### `awards`
- `id`, `award_name`, `awarding_organization`, `award_year`
- `category`, `description`

#### `cap_statements`
- `id`, `title`, `description`, `status`
- `created_by_user_id`, `template_id`

#### `cap_statement_versions`
- `id`, `cap_statement_id`, `version_number`, `version_name`
- `content`, `settings` (JSON)

### Relations
- `deal_lawyers` - Many-to-many: deals ↔ lawyers
- `lawyer_awards` - Many-to-many: lawyers ↔ awards
- `deal_awards` - Many-to-many: deals ↔ awards

---

## Setup & Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=capability_statement_db
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Quick Start

1. **Database Setup**
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file (see above)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Default Users
- Admin: `admin@lawfirm.com` / `admin123`
- Associate: `associate@lawfirm.com` / `associate123`

**⚠️ Change passwords in production!**

---

## Key Technical Details

### Null Safety
All template variables have null-safe fallbacks:
- Empty strings for text fields
- Zero for numeric fields
- Default values for critical fields
- Defensive formatting throughout

### Error Handling
- Template not found: Returns 503 with JSON error
- Generation errors: Returns 500 with error details
- Frontend parses JSON errors from ArrayBuffer responses

### Logging
- Structured logging via `logger.js`
- Debug logs for document generation steps
- Footer propagation logging
- Payload verification logging

### Security
- JWT authentication required for all endpoints (except `/health`, `/auth/login`)
- RBAC: Admin vs Associate roles
- CORS configured via environment variables
- Password hashing with bcrypt

### Performance
- Database connection pooling
- Async/await throughout
- Efficient payload construction
- Minimal template processing overhead

---

## Troubleshooting

### Document Generation Fails
1. Check template file exists: `backend/src/template/Cap Statement Template V1.docx`
2. Verify template path in logs: `📄 Template path resolved to: ...`
3. Check payload logs: `=== FOOTER DEBUG INFO ===`
4. Verify database connection

### Footer Not Appearing
1. Check footer propagation logs: `✅ Footer placeholders ensured`
2. Verify placeholders in template footer: `{client_name}`, `{tender_number}`
3. Check payload contains footer values

### Template Placeholders Not Working
1. Run placeholder extraction: `node backend/scripts/extract-template-placeholders.js`
2. Verify placeholder names match exactly (case-sensitive)
3. Check payload logs for missing placeholders

---

## Support & Maintenance

### Extracting Template Placeholders
```bash
cd backend
node scripts/extract-template-placeholders.js
```

### Database Migrations
- Single schema file: `backend/database/schema.sql`
- Run migrations manually: `mysql -u root -p < backend/database/schema.sql`

### Adding New Template Variables
1. Add field to `capStatementService.buildTemplatePayload()`
2. Add fallback in `docGenerator.generate()` payload
3. Update template with new placeholder
4. Test generation

---

**Documentation Version:** 1.0  
**Last Updated:** 2026-02-13
