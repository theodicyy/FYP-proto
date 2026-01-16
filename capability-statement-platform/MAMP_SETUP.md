# Setting Up Database with MAMP & phpMyAdmin

## Step 1: Start MAMP

1. Open **MAMP** application
2. Click **"Start Servers"** (Apache and MySQL should start)
3. Note the ports:
   - **Apache**: Usually port 8888
   - **MySQL**: Usually port **8889** (not 3306!)

## Step 2: Access phpMyAdmin

1. Open your browser
2. Go to: **http://localhost:8888/phpMyAdmin** (or http://localhost:8888/MAMP/phpMyAdmin)
3. You should see the phpMyAdmin interface

## Step 3: Create the Database

1. In phpMyAdmin, click on **"New"** in the left sidebar (or click "Databases" tab)
2. Enter database name: **`capability_statement_db`**
3. Choose collation: **`utf8mb4_unicode_ci`** (or leave default)
4. Click **"Create"**

## Step 4: Import Schema

1. Click on **`capability_statement_db`** in the left sidebar to select it
2. Click the **"Import"** tab at the top
3. Click **"Choose File"** button
4. Navigate to: `capability-statement-platform/backend/database/schema.sql`
5. Scroll down and click **"Go"** button
6. Wait for success message - you should see all tables created

## Step 5: Import Sample Data

1. Make sure **`capability_statement_db`** is still selected
2. Click the **"Import"** tab again
3. Click **"Choose File"** button
4. Navigate to: `capability-statement-platform/backend/database/sample_data.sql`
5. Click **"Go"** button
6. Wait for success message - you should see sample data inserted

## Step 6: Verify Tables

1. In the left sidebar, expand **`capability_statement_db`**
2. You should see these tables:
   - ✅ `lawyers`
   - ✅ `deals`
   - ✅ `awards`
   - ✅ `cap_statements`
   - ✅ `cap_statement_versions`
   - ✅ `deal_lawyers`
   - ✅ `award_lawyers`

3. Click on any table (e.g., `lawyers`) and click **"Browse"** to see sample data

## Step 7: Configure Backend .env File

Create or update `backend/.env` file with MAMP MySQL settings:

```bash
cd capability-statement-platform/backend
```

Create `.env` file with these MAMP-specific settings:

```env
PORT=3000
NODE_ENV=development

# MAMP MySQL Configuration
DB_HOST=localhost
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=capability_statement_db

LOG_LEVEL=info
```

**Important MAMP Settings:**
- **DB_PORT**: `8889` (MAMP's default MySQL port, NOT 3306)
- **DB_USER**: `root` (MAMP default)
- **DB_PASSWORD**: `root` (MAMP default - change if you've modified it)

## Step 8: Test Connection

1. Start your backend server:
   ```bash
   cd capability-statement-platform/backend
   npm install  # if not done already
   npm run dev
   ```

2. You should see: **✅ Database connected successfully**

3. Test the API:
   - Open: http://localhost:3000/api/v1/health
   - Should return: `{"status":"ok",...}`

## Troubleshooting

### Can't access phpMyAdmin
- Make sure MAMP servers are running (green lights)
- Try: http://localhost:8888/phpMyAdmin
- Or: http://localhost:8888/MAMP/phpMyAdmin
- Check MAMP preferences for custom ports

### Connection refused error
- Verify MySQL is running in MAMP
- Check port is **8889** (not 3306) in `.env`
- Verify database name is exactly: `capability_statement_db`

### Wrong password
- MAMP default is `root` for both username and password
- If you changed it, update `.env` file
- You can reset MAMP MySQL password in MAMP preferences

### Tables not showing
- Make sure you selected the database before importing
- Check for error messages in phpMyAdmin import results
- Try importing schema.sql again

### Import errors
- Make sure you're importing into the correct database
- Check file paths are correct
- Try copying SQL content and pasting into "SQL" tab instead

## Alternative: Manual SQL Execution

If import doesn't work, you can run SQL manually:

1. In phpMyAdmin, select `capability_statement_db`
2. Click **"SQL"** tab
3. Copy contents of `schema.sql` (skip the CREATE DATABASE line)
4. Paste and click **"Go"**
5. Repeat for `sample_data.sql`

## Quick Reference

**MAMP Defaults:**
- MySQL Port: **8889**
- Username: **root**
- Password: **root**
- phpMyAdmin: http://localhost:8888/phpMyAdmin

**Database Name:** `capability_statement_db`
