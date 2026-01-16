# Capability Statement Platform

Internal legal-tech platform for law firm capability statement generation.

## Tech Stack

- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: Vue 3 (Composition API) + Pinia + Tailwind CSS
- **Scripts**: Python (Excel ingestion, data seeding)

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
      /models          - Data models
      /middlewares     - Express middlewares
      /utils           - Utility functions
    /database          - SQL schema and sample data
    app.js             - Express app configuration
    server.js          - Server entry point
  /frontend
    /src
      /assets          - CSS and static assets
      /components      - Vue components
      /views           - Page components
      /stores          - Pinia stores
      /services        - API service layer
      /router          - Vue Router configuration
    vite.config.js     - Vite configuration
    tailwind.config.js - Tailwind CSS configuration
  /scripts
    ingest_excel.py    - Excel to MySQL ingestion
    seed_data.py       - Database seeding script
  README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- Python (v3.8+)
- npm or yarn

### Database Setup

1. Create MySQL database:
   ```bash
   mysql -u root -p
   CREATE DATABASE capability_statement_db;
   ```

2. Run schema and sample data:
   ```bash
   mysql -u root -p capability_statement_db < backend/database/schema.sql
   mysql -u root -p capability_statement_db < backend/database/sample_data.sql
   ```

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example` if available):
   ```bash
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=capability_statement_db

   # Logging
   LOG_LEVEL=info
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### Python Scripts Setup

1. Install Python dependencies:
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

2. Create `.env` file in scripts directory (or use parent .env):
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=capability_statement_db
   ```

3. Run Excel ingestion:
   ```bash
   python ingest_excel.py --file path/to/data.xlsx --type all
   ```

   Options:
   - `--file`: Path to Excel file (required)
   - `--sheet`: Specific sheet name (optional)
   - `--type`: Data type - lawyers, deals, awards, or all (default: all)

4. Seed sample data:
   ```bash
   python seed_data.py
   ```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Data Endpoints
- `GET /api/v1/lawyers` - List lawyers (filters: practice_group, source_system)
- `GET /api/v1/lawyers/:id` - Get lawyer by ID
- `GET /api/v1/deals` - List deals (filters: industry, practice_group, deal_year, source_system)
- `GET /api/v1/deals/:id` - Get deal by ID
- `GET /api/v1/awards` - List awards (filters: industry, practice_group, award_year, source_system)
- `GET /api/v1/awards/:id` - Get award by ID

### Capability Statement Endpoints
- `POST /api/v1/cap-statements/generate` - Generate capability statement
  ```json
  {
    "dealIds": [1, 2, 3],
    "awardIds": [1, 2],
    "lawyerIds": [1, 2],
    "settings": {
      "includeDeals": true,
      "includeAwards": true,
      "includeLawyers": true,
      "format": "standard"
    }
  }
  ```
- `POST /api/v1/cap-statements` - Save capability statement
  ```json
  {
    "title": "Q4 2023 Corporate Practice",
    "description": "Quarterly overview",
    "dealIds": [1, 2],
    "awardIds": [1],
    "lawyerIds": [1],
    "settings": {...},
    "content": "Generated content..."
  }
  ```
- `GET /api/v1/cap-statements` - List capability statements (filter: status)
- `GET /api/v1/cap-statements/:id` - Get capability statement with versions

## Architecture

### Backend Architecture (Layered)
- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Business logic, orchestration
- **Repositories**: Database queries, data access
- **Models**: Data structures (if needed)

### Frontend Architecture
- **Views**: Page-level components
- **Components**: Reusable UI components
- **Stores (Pinia)**: State management
- **Services**: API communication layer
- **Router**: Navigation and routing

## Features

- ✅ Multi-select data aggregation (Lawyers, Deals, Awards)
- ✅ Advanced filtering (industry, practice group, year)
- ✅ Capability statement generation (stub - no LLM)
- ✅ Statement versioning and history
- ✅ Excel data ingestion
- ✅ RESTful API with proper error handling
- ✅ Modern Vue 3 UI with Tailwind CSS

## Development Notes

- **No Authentication**: Currently no auth system (designed to be extensible)
- **Stub Generator**: Capability statement generator returns formatted placeholder text (no LLM integration)
- **MySQL Source of Truth**: Excel is ingestion layer only, SQL is authoritative
- **Python Scripts**: Isolated scripts, no web server integration

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Frontend API Errors
- Verify backend is running on port 3000
- Check CORS settings if accessing from different origin
- Review browser console for detailed errors

### Excel Ingestion Issues
- Verify Excel file format matches expected schema
- Check database connection in Python script
- Review error messages in script output

## License

Internal use only - Law Firm Capability Statement Platform
