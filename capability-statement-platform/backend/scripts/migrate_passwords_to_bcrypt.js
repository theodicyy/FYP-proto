#!/usr/bin/env node
/**
 * Password Migration Script
 * Migrates existing SHA256 password hashes to bcrypt
 * 
 * Usage: node scripts/migrate_passwords_to_bcrypt.js
 */

import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

// SHA256 hash function (old method) - for verification only
import crypto from 'crypto';

function hashPasswordSHA256(password) {
  const salt = process.env.PASSWORD_SALT || 'default_salt_change_in_production';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function migratePasswords() {
  try {
    logger.info('Starting password migration...');

    // Get all users
    const [users] = await pool.execute('SELECT id, email, password_hash FROM users');

    if (users.length === 0) {
      logger.info('No users found in database');
      return;
    }

    logger.info(`Found ${users.length} users to check`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Check if hash is already bcrypt (starts with $2a$, $2b$, or $2y$)
        const isBcrypt = /^\$2[ayb]\$/.test(user.password_hash);

        if (isBcrypt) {
          logger.debug(`User ${user.email} already has bcrypt hash, skipping`);
          skipped++;
          continue;
        }

        // If it's SHA256 (64 hex characters), we need to reset it
        // Since we can't reverse SHA256, we'll set a temporary password
        // that the user needs to change on first login
        if (user.password_hash.length === 64 && /^[a-f0-9]{64}$/i.test(user.password_hash)) {
          logger.info(`Migrating user ${user.email} from SHA256 to bcrypt`);

          // Generate a temporary password (user will need to reset)
          const tempPassword = `temp_${crypto.randomBytes(8).toString('hex')}`;
          const bcryptHash = await bcrypt.hash(tempPassword, 10);

          // Update password hash
          await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [bcryptHash, user.id]
          );

          logger.warn(`⚠️  User ${user.email} password reset required!`);
          logger.warn(`   Temporary password: ${tempPassword}`);
          logger.warn(`   User must change password on first login`);
          
          migrated++;
        } else {
          logger.warn(`User ${user.email} has unknown hash format, skipping`);
          skipped++;
        }
      } catch (error) {
        logger.error(`Error migrating user ${user.email}`, { error: error.message });
        errors++;
      }
    }

    logger.info('Password migration complete', {
      total: users.length,
      migrated,
      skipped,
      errors
    });

    if (migrated > 0) {
      logger.warn('⚠️  IMPORTANT: Users with migrated passwords need to reset them!');
    }

  } catch (error) {
    logger.error('Migration failed', { error: error.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migratePasswords()
  .then(() => {
    logger.info('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration script failed', { error: error.message });
    process.exit(1);
  });
