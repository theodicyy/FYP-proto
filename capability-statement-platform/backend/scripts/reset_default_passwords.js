#!/usr/bin/env node
/**
 * Reset Default Passwords Script
 * Resets admin and associate passwords to known values using bcrypt
 * 
 * Usage: node scripts/reset_default_passwords.js
 * 
 * This will set:
 * - admin@lawfirm.com → admin123
 * - associate@lawfirm.com → associate123
 */

import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

async function resetDefaultPasswords() {
  try {
    logger.info('Resetting default user passwords...');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

    // Default users and passwords
    const defaultUsers = [
      { email: 'admin@lawfirm.com', password: 'admin123', role: 'admin' },
      { email: 'associate@lawfirm.com', password: 'associate123', role: 'associate' }
    ];

    for (const user of defaultUsers) {
      try {
        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(user.password, saltRounds);

        // Check if user exists
        const [existing] = await pool.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );

        if (existing.length === 0) {
          logger.warn(`User ${user.email} not found, creating...`);
          
          // Create user if doesn't exist
          await pool.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_type, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              user.email,
              passwordHash,
              user.role === 'admin' ? 'Admin' : 'Associate',
              'User',
              user.role,
              true
            ]
          );
          logger.info(`✅ Created user ${user.email}`);
        } else {
          // Update existing user password
          await pool.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [passwordHash, user.email]
          );
          logger.info(`✅ Reset password for ${user.email}`);
        }

        logger.info(`   Email: ${user.email}`);
        logger.info(`   Password: ${user.password}`);
        logger.info(`   Role: ${user.role}`);

      } catch (error) {
        logger.error(`Error resetting password for ${user.email}`, { error: error.message });
      }
    }

    logger.info('✅ Default password reset complete!');
    logger.info('');
    logger.info('You can now login with:');
    logger.info('  Admin: admin@lawfirm.com / admin123');
    logger.info('  Associate: associate@lawfirm.com / associate123');

  } catch (error) {
    logger.error('Password reset failed', { error: error.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run reset
resetDefaultPasswords()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed', { error: error.message });
    process.exit(1);
  });
