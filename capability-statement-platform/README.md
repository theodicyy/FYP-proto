# Capability Statement Platform

Internal legal-tech platform for law firm capability statement generation.

## Tech Stack

- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: Vue 3 (Composition API) + Pinia + TipTap + Tailwind CSS
- **Scripts**: Python (Excel ingestion, data seeding)

## Quick Start

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- Python (v3.8+) - optional, for data ingestion scripts

### 1. Database Setup

```bash
# Import schema (creates database, tables, and default users)
mysql -u root -p < backend/database/schema.sql
```

**Default Users** (change passwords in production!):
- Admin: `admin@lawfirm.com` / `admin123`
- Associate: `associate@lawfirm.com` / `associate123`

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=capability_statement_db
LOG_LEVEL=info
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

npm run dev
```

Backend runs on: **http://localhost:3000**

### 3. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 4. Access Application

Open **http://localhost:5173** and login with default credentials.

## Project Structure

```
/capability-statement-platform
  /backend
    /src
      /config          - Database configuration
      /routes          - API route definitions
      /controllers     - Request handlers
      /services        - Business logic layer
      /repositories    - Data access layer
      /middlewares     - Auth, RBAC, error handling
      /utils           - Logger, utilities
    /database          - SQL schema (single file)
    /public/uploads    - Uploaded images
    app.js             - Express app configuration
    server.js          - Server entry point
  /frontend
    /src
      /components      - Reusable Vue components
      /views           - Page components
      /stores          - Pinia state stores
      /services        - API service layer
      /router          - Vue Router configuration
    vite.config.js     - Vite configuration
  /scripts
    ingest_excel.py    - Excel to MySQL ingestion
    seed_data.py       - Database seeding script
```

## Features

### Core Functionality
- **Data Aggregation**: Browse and select Lawyers, Deals, Awards
- **Capability Statements**: Generate, edit, save, and version documents
- **Template Management**: Create and edit document templates
- **Google Docs-style Editor**: Rich text editing with tables, images, formatting

### Authentication & Authorization
- **Role-Based Access Control (RBAC)**: Admin and Associate roles
- **JWT Authentication**: Secure token-based auth
- **Admin-only Features**: Manage reference data (lawyers, deals, awards, templates)

### Document Features
- **Version Control**: Track document versions with custom naming
- **PDF Export**: Download documents as PDF (via browser print)
- **Image Upload**: Insert and resize images
- **Table Editing**: Insert and edit tables with Google Docs-like UI

## API Reference

### Authentication
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Reference Data (Admin only for write)
- `GET/POST/PUT/DELETE /api/v1/lawyers` - Lawyers CRUD
- `GET/POST/PUT/DELETE /api/v1/deals` - Deals CRUD
- `GET/POST/PUT/DELETE /api/v1/awards` - Awards CRUD
- `GET/POST/PUT/DELETE /api/v1/templates` - Simple templates CRUD
- `GET/POST/PUT/DELETE /api/v1/template-definitions` - Structured templates CRUD

### Capability Statements
- `GET /api/v1/cap-statements` - List statements
- `POST /api/v1/cap-statements` - Create statement
- `GET /api/v1/cap-statements/:id` - Get statement with versions
- `PUT /api/v1/cap-statements/:id` - Update statement
- `DELETE /api/v1/cap-statements/:id` - Delete statement and versions
- `POST /api/v1/cap-statements/:id/versions` - Create version
- `PUT /api/v1/cap-statements/:id/versions/:versionId` - Update version

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | - |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | `capability_statement_db` |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173` |
| `LOG_LEVEL` | Log level | `info` |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |

## Troubleshooting

### Database Issues
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify `.env` credentials

### Backend Issues
- Check port 3000 is available
- Verify all env variables are set
- Check logs for detailed errors

### Frontend Issues
- Check backend is running on port 3000
- Clear browser cache and localStorage
- Check browser console for errors

## Development

```bash
# Start both servers (run in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

## License

Internal use only - Law Firm Capability Statement Platform
