import pool from '../config/database.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

class UserRepository {
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching user by email', { error: error.message, email });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
        [id]
      );
      return rows[0] ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Error fetching user by ID', { error: error.message, id });
      throw error;
    }
  }

  async createSession(userId, token, expiresAt) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating session', { error: error.message, userId });
      throw error;
    }
  }

  async findSessionByToken(token) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.*, u.* 
         FROM user_sessions s
         INNER JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = TRUE`,
        [token]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching session by token', { error: error.message });
      throw error;
    }
  }

  async deleteSession(token) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM user_sessions WHERE token = ?',
        [token]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting session', { error: error.message });
      throw error;
    }
  }

  async cleanupExpiredSessions() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM user_sessions WHERE expires_at < NOW()'
      );
      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up expired sessions', { error: error.message });
      throw error;
    }
  }
}

export default new UserRepository();
