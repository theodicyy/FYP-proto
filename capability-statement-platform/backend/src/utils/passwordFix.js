/**
 * Password Auto-Fix Utility
 * Automatically fixes SHA256 password hashes to bcrypt on server startup
 * This ensures passwords work after database migrations
 */

import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { logger } from './logger.js';

/**
 * Check if a hash is SHA256 format (64 hex characters)
 */
function isSHA256Hash(hash) {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Check if a hash is bcrypt format
 */
function isBcryptHash(hash) {
  return /^\$2[ayb]\$/.test(hash);
}

/**
 * Auto-fix passwords on server startup
 * Converts SHA256 hashes to bcrypt for default users
 */
export async function autoFixPasswords() {
  try {
    logger.info('Checking password hash formats...');

    // Get default users
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, role_type FROM users WHERE email IN (?, ?)',
      ['admin@lawfirm.com', 'associate@lawfirm.com']
    );

    if (users.length === 0) {
      logger.info('No default users found, skipping password fix');
      return;
    }

    let fixed = 0;
    const defaultPasswords = {
      'admin@lawfirm.com': 'admin123',
      'associate@lawfirm.com': 'associate123'
    };

    for (const user of users) {
      // Check if password is SHA256 (needs fixing)
      if (isSHA256Hash(user.password_hash)) {
        logger.warn(`Fixing SHA256 password hash for ${user.email}`);
        
        const password = defaultPasswords[user.email];
        if (!password) {
          logger.warn(`No default password found for ${user.email}, skipping`);
          continue;
        }

        // Generate bcrypt hash
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        const bcryptHash = await bcrypt.hash(password, saltRounds);

        // Update in database
        await pool.execute(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [bcryptHash, user.id]
        );

        logger.info(`✅ Fixed password hash for ${user.email}`);
        fixed++;
      } else if (isBcryptHash(user.password_hash)) {
        logger.debug(`Password hash for ${user.email} is already bcrypt format`);
      } else {
        logger.warn(`Unknown password hash format for ${user.email}`);
      }
    }

    if (fixed > 0) {
      logger.info(`Auto-fixed ${fixed} password hash(es)`);
    } else {
      logger.info('All password hashes are in correct format');
    }

  } catch (error) {
    // Don't fail server startup if password fix fails
    logger.error('Error in auto-fix passwords', { error: error.message });
  }
}
