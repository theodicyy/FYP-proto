# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v18+) installed
- ✅ MySQL (v8+) installed and running
- ✅ Python (v3.8+) installed (for scripts only)

## Step-by-Step Startup

### 1. Database Setup (First Time Only)

```bash
# Create database and load schema
mysql -u root -p < backend/database/schema.sql

# Load sample data
mysql -u root -p < backend/database/sample_data.sql
```

Or manually:
```sql
mysql -u root -p
CREATE DATABASE capability_statement_db;
USE capability_statement_db;
SOURCE backend/database/schema.sql;
SOURCE backend/database/sample_data.sql;
```

### 2. Backend Setup

```bash
# Navigate to backend
cd capability-statement-platform/backend

# Install dependencies (first time only)
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=capability_statement_db
LOG_LEVEL=info
EOF

# Edit .env with your MySQL password
# Then start the server
npm run dev
```

Backend will run on: **http://localhost:3000**

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to frontend (in a new terminal)
cd capability-statement-platform/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1/health

## Quick Commands Reference

### Backend
```bash
cd backend
npm install          # First time only
npm run dev          # Start development server
npm start            # Start production server
```

### Frontend
```bash
cd frontend
npm install          # First time only
npm run dev          # Start development server
npm run build        # Build for production
```

### Database
```bash
# Reset database with sample data
mysql -u root -p capability_statement_db < backend/database/schema.sql
mysql -u root -p capability_statement_db < backend/database/sample_data.sql
```

## Troubleshooting

### Backend won't start
- ✅ Check MySQL is running: `mysql -u root -p`
- ✅ Verify `.env` file exists and has correct credentials
- ✅ Check port 3000 is not in use

### Frontend won't start
- ✅ Check Node.js version: `node --version` (should be v18+)
- ✅ Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- ✅ Check port 5173 is not in use

### Database connection errors
- ✅ Verify MySQL is running
- ✅ Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- ✅ Verify credentials in `.env` file

### API calls failing
- ✅ Ensure backend is running on port 3000
- ✅ Check browser console for CORS errors
- ✅ Verify API endpoint: http://localhost:3000/api/v1/health

## Development Workflow

1. **Start MySQL** (if not running as service)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `cd frontend && npm run dev` (new terminal)
4. **Open Browser**: http://localhost:5173

Both servers support hot-reload, so changes will automatically refresh!
