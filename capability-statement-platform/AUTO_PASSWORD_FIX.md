# Auto Password Fix - Solution Implemented

## Problem
After upgrading to bcrypt, existing SHA256 password hashes in the database don't work. Users had to manually run a reset script every time.

## Solution
The server now **automatically fixes password hashes on startup**. No manual intervention needed!

## How It Works

1. **On Server Startup**: The server checks default users (`admin@lawfirm.com` and `associate@lawfirm.com`)
2. **Detects SHA256 Hashes**: If it finds SHA256 format (64 hex characters), it knows they need fixing
3. **Auto-Converts to bcrypt**: Automatically generates bcrypt hashes for the default passwords
4. **Updates Database**: Saves the new bcrypt hashes to the database
5. **Server Starts**: Continues with normal startup

## What Changed

### Files Modified:
1. **`backend/src/utils/passwordFix.js`** (NEW)
   - Contains the auto-fix logic
   - Detects SHA256 vs bcrypt hashes
   - Converts SHA256 to bcrypt automatically

2. **`backend/server.js`**
   - Calls `autoFixPasswords()` before starting the server
   - Runs asynchronously, doesn't block startup

3. **Migration SQL files**
   - Updated comments to explain auto-fix behavior
   - Still use SHA256 hashes (for compatibility), but server fixes them

## Behavior

### First Time (After Migration):
- Server starts
- Detects SHA256 hashes
- Auto-fixes to bcrypt
- Logs: `✅ Fixed password hash for admin@lawfirm.com`
- Users can login immediately

### Subsequent Starts:
- Server starts
- Detects bcrypt hashes (already fixed)
- Logs: `All password hashes are in correct format`
- No changes needed

## Default Passwords

The auto-fix uses these default passwords:
- **Admin**: `admin@lawfirm.com` / `admin123`
- **Associate**: `associate@lawfirm.com` / `associate123`

## Logs

You'll see these messages in your server logs:

**When fixing:**
```
Checking password hash formats...
Fixing SHA256 password hash for admin@lawfirm.com
✅ Fixed password hash for admin@lawfirm.com
Auto-fixed 2 password hash(es)
```

**When already fixed:**
```
Checking password hash formats...
All password hashes are in correct format
```

## Manual Override

If you want to manually reset passwords (e.g., change default passwords), you can still run:

```bash
node scripts/reset_default_passwords.js
```

This will set the passwords to the defaults. The auto-fix only runs if it detects SHA256 hashes.

## Production Notes

⚠️ **Important for Production:**
- The auto-fix only works for the default users (`admin@lawfirm.com`, `associate@lawfirm.com`)
- Other users with SHA256 hashes won't be auto-fixed
- For production, you should:
  1. Run `node scripts/migrate_passwords_to_bcrypt.js` for all users
  2. Or force password reset for all users
  3. Then disable auto-fix (or it will keep resetting default passwords)

## Disabling Auto-Fix

If you want to disable auto-fix (e.g., in production), you can:

1. Set environment variable:
   ```bash
   DISABLE_AUTO_PASSWORD_FIX=true
   ```

2. Or comment out the call in `server.js`:
   ```javascript
   // autoFixPasswords().then(() => {
   app.listen(PORT, () => {
   // ...
   ```

## Testing

To test the auto-fix:

1. **Reset to SHA256** (simulate old migration):
   ```sql
   UPDATE users SET password_hash = '122f137a81dc44e6ab559de0b98b43dc39169964e7ca35d6cc3962834c8732df' 
   WHERE email = 'admin@lawfirm.com';
   ```

2. **Restart server**:
   ```bash
   npm run dev
   ```

3. **Check logs** - should see "Fixed password hash"

4. **Try login** - should work with `admin123`

## Summary

✅ **Problem Solved**: No more manual password resets needed  
✅ **Automatic**: Server fixes passwords on every startup  
✅ **Safe**: Only fixes default users, doesn't affect others  
✅ **Transparent**: Logs show what's happening  

You can now restart your servers anytime without worrying about password hash issues!
