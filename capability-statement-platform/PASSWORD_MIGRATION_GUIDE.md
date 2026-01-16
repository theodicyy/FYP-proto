# Password Migration Guide

## Problem

After upgrading from SHA256 to bcrypt password hashing, existing user passwords no longer work because:
- Old passwords were hashed with SHA256
- New system expects bcrypt hashes
- These are incompatible formats

## Solution Options

### Option 1: Reset Default Passwords (Recommended for Development)

This is the quickest solution if you just need to get admin/associate working again.

```bash
cd backend
node scripts/reset_default_passwords.js
```

This will:
- Reset `admin@lawfirm.com` password to `admin123`
- Reset `associate@lawfirm.com` password to `associate123`
- Create users if they don't exist
- Use bcrypt hashing

**After running, you can login with:**
- Admin: `admin@lawfirm.com` / `admin123`
- Associate: `associate@lawfirm.com` / `associate123`

### Option 2: Migrate All Passwords (For Production)

If you have existing users with SHA256 passwords:

```bash
cd backend
node scripts/migrate_passwords_to_bcrypt.js
```

**Note:** This script will generate temporary passwords because SHA256 cannot be reversed. Users will need to reset their passwords.

### Option 3: Manual SQL Reset (Quick Fix)

If scripts don't work, you can manually reset in phpMyAdmin:

```sql
USE capability_statement_db;

-- First, generate bcrypt hash for 'admin123'
-- You'll need to run this in Node.js:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h))"

-- Then update (replace HASH_HERE with the generated hash):
UPDATE users 
SET password_hash = 'HASH_HERE' 
WHERE email = 'admin@lawfirm.com';

-- Do the same for associate
UPDATE users 
SET password_hash = 'HASH_HERE' 
WHERE email = 'associate@lawfirm.com';
```

## Quick Test

1. **Check database connection:**
   ```bash
   cd backend
   npm run dev
   ```
   Look for: `✅ Database connected successfully`

2. **Reset passwords:**
   ```bash
   node scripts/reset_default_passwords.js
   ```

3. **Test login:**
   - Go to: http://localhost:5173/login
   - Try: `admin@lawfirm.com` / `admin123`

## Troubleshooting

### "Database connection error"
- Check `.env` file has correct DB credentials
- Verify MySQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### "User not found"
- Run the reset script - it will create users if missing
- Or manually create users in database

### "Invalid credentials" after reset
- Make sure you ran the reset script
- Check password hash in database starts with `$2a$` or `$2b$` (bcrypt format)
- If it's 64 hex characters, it's still SHA256 - run reset script again

### Script fails with "bcrypt not found"
```bash
cd backend
npm install
```

## Verification

Check password hash format in database:

```sql
SELECT email, LEFT(password_hash, 10) as hash_prefix FROM users;
```

- ✅ Bcrypt: Starts with `$2a$` or `$2b$`
- ❌ SHA256: 64 hex characters (like `122f137a81...`)

If you see SHA256 hashes, run the reset script again.
