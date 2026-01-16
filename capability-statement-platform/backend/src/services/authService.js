import bcrypt from 'bcrypt';
import crypto from 'crypto';
import userRepository from '../repositories/userRepository.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

class AuthService {
  // Password hashing using bcrypt (production-ready)
  async hashPassword(password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Error hashing password', { error: error.message });
      throw error;
    }
  }

  async verifyPassword(password, hash) {
    try {
      const matches = await bcrypt.compare(password, hash);
      if (!matches) {
        logger.warn('Password verification failed', { hashPrefix: hash.substring(0, 8) });
      }
      return matches;
    } catch (error) {
      logger.error('Error verifying password', { error: error.message });
      throw error;
    }
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async login(email, password) {
    try {
      const userData = await userRepository.findByEmail(email);
      if (!userData) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Verify password
      const isValid = await this.verifyPassword(password, userData.password_hash);
      if (!isValid) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Create session
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await userRepository.createSession(userData.id, token, expiresAt);

      const user = new User(userData);

      logger.info('User logged in', { userId: user.id, email, role: user.roleType });

      return {
        user,
        token,
        expiresAt
      };
    } catch (error) {
      logger.error('Error in login', { error: error.message, email });
      throw error;
    }
  }

  async authenticateToken(token) {
    try {
      const session = await userRepository.findSessionByToken(token);
      if (!session) {
        return null;
      }

      const user = new User({
        id: session.user_id,
        email: session.email,
        first_name: session.first_name,
        last_name: session.last_name,
        role_type: session.role_type,
        is_active: session.is_active,
        created_at: session.created_at
      });

      return user;
    } catch (error) {
      logger.error('Error authenticating token', { error: error.message });
      return null;
    }
  }

  async logout(token) {
    try {
      await userRepository.deleteSession(token);
      logger.info('User logged out', { token: token.substring(0, 8) + '...' });
      return true;
    } catch (error) {
      logger.error('Error in logout', { error: error.message });
      throw error;
    }
  }
}

export default new AuthService();
