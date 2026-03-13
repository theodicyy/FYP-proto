import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class CapStatementRepository {

  // =====================================================
  // LIST all statements (latest version per group)
  // =====================================================
  async findAll(filters = {}) {
    try {
      let query = `
        SELECT g.*
        FROM cap_statement_generate g
        INNER JOIN (
          SELECT group_id, MAX(version_number) AS max_ver
          FROM cap_statement_generate
          GROUP BY group_id
        ) latest ON g.group_id = latest.group_id AND g.version_number = latest.max_ver
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += ' AND g.status = ?';
        params.push(filters.status);
      }
      if (filters.created_by_user_id) {
        query += ' AND g.created_by_user_id = ?';
        params.push(filters.created_by_user_id);
      }

      query += ' ORDER BY g.created_at DESC';

      const [rows] = await pool.execute(query, params);
      // Don't return the BLOB in list queries
      return rows.map(r => ({ ...r, docx_blob: undefined }));
    } catch (error) {
      logger.error('Error fetching capability statements', { error: error.message });
      throw error;
    }
  }

  // =====================================================
  // GET single row by id (without BLOB)
  // =====================================================
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, group_id, version_number, title, status, created_by_user_id, manual_fields, selected_ids, selected_entities, created_at, updated_at FROM cap_statement_generate WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching cap statement by ID', { error: error.message, id });
      throw error;
    }
  }

  // =====================================================
  // GET all versions for a group
  // =====================================================
  async findVersionsByGroupId(groupId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, group_id, version_number, title, status, created_by_user_id, manual_fields, selected_ids, selected_entities, created_at, updated_at FROM cap_statement_generate WHERE group_id = ? ORDER BY version_number DESC',
        [groupId]
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching versions by group_id', { error: error.message, groupId });
      throw error;
    }
  }

  // =====================================================
  // CREATE (insert a new generation row)
  // =====================================================
  async create(data) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO cap_statement_generate
         (group_id, version_number, title, status, created_by_user_id, manual_fields, selected_ids, selected_entities, docx_blob)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.group_id,
          data.version_number || 1,
          data.title || null,
          data.status || 'generated',
          data.created_by_user_id || null,
          JSON.stringify(data.manual_fields || {}),
          JSON.stringify(data.selected_ids || {}),
          JSON.stringify(data.selected_entities || {}),
          data.docx_blob || null
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating cap statement', { error: error.message });
      throw error;
    }
  }

  // =====================================================
  // UPDATE status
  // =====================================================
  async update(id, data) {
    try {
      const updates = [];
      const params = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }

      if (updates.length === 0) return false;

      params.push(id);
      const [result] = await pool.execute(
        `UPDATE cap_statement_generate SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating cap statement', { error: error.message, id });
      throw error;
    }
  }

  // =====================================================
  // DELETE all versions for a group
  // =====================================================
  async deleteByGroupId(groupId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM cap_statement_generate WHERE group_id = ?',
        [groupId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting cap statement group', { error: error.message, groupId });
      throw error;
    }
  }

  // =====================================================
  // GET DOCX BLOB by id
  // =====================================================
  async getDocxBlob(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT docx_blob FROM cap_statement_generate WHERE id = ?',
        [id]
      );
      return rows[0]?.docx_blob || null;
    } catch (error) {
      logger.error('Error fetching docx blob', { error: error.message, id });
      throw error;
    }
  }

  // =====================================================
  // GET latest version number for a group
  // =====================================================
  async getLatestVersionNumber(groupId) {
    try {
      const [rows] = await pool.execute(
        'SELECT MAX(version_number) as max_ver FROM cap_statement_generate WHERE group_id = ?',
        [groupId]
      );
      return rows[0]?.max_ver || 0;
    } catch (error) {
      logger.error('Error fetching latest version number', { error: error.message, groupId });
      throw error;
    }
  }
}

export default new CapStatementRepository();
