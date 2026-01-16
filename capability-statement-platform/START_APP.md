# How to Run the App (Quick Guide)

## Prerequisites ✅
- MAMP is running (MySQL on port 8889)

## Step 1: Set Up Backend

Open Terminal and run:

```bash
cd "/Users/andy/Desktop/FYP proto/capability-statement-platform/backend"

# Install dependencies (first time only)
npm install

# Start the backend server
npm run dev
```

**Keep this terminal open!** The backend will run on: http://localhost:3000

You should see:
```
✅ Database connected successfully
🚀 Server running on port 3000
```

## Step 2: Set Up Frontend (New Terminal)

Open a **NEW Terminal window** and run:

```bash
cd "/Users/andy/Desktop/FYP proto/capability-statement-platform/frontend"

# Install dependencies (first time only)
npm install

# Start the frontend server
npm run dev
```

**Keep this terminal open too!** The frontend will run on: http://localhost:5173

## Step 3: Access the App

Open your browser and go to:
👉 **http://localhost:5173**

## Quick Commands (Copy & Paste)

### Terminal 1 - Backend:
```bash
cd "/Users/andy/Desktop/FYP proto/capability-statement-platform/backend" && npm install && npm run dev
```

### Terminal 2 - Frontend:
```bash
cd "/Users/andy/Desktop/FYP proto/capability-statement-platform/frontend" && npm install && npm run dev
```

## Troubleshooting

### Backend won't start?
- ✅ Check MAMP MySQL is running (port 8889)
- ✅ Verify `.env` file exists in `backend/` folder
- ✅ Check database `capability_statement_db` exists in phpMyAdmin

### Frontend won't start?
- ✅ Make sure backend is running first
- ✅ Check Node.js version: `node --version` (should be v18+)

### Database connection error?
- ✅ Verify MAMP MySQL is running
- ✅ Check `.env` has correct port (8889) and password (root)
- ✅ Make sure database exists: http://localhost:8888/phpMyAdmin

## What You Should See

**Backend Terminal:**
```
✅ Database connected successfully
🚀 Server running on port 3000
📡 Environment: development
```

**Frontend Terminal:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Browser:**
- Dashboard page with statistics
- Navigation menu (Dashboard, Aggregation, Library)
