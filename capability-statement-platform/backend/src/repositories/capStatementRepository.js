import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class CapStatementRepository {
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM cap_statements WHERE 1=1';
      const params = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      // Filter by user ownership (for Associates)
      if (filters.created_by_user_id) {
        query += ' AND created_by_user_id = ?';
        params.push(filters.created_by_user_id);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching capability statements', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cap_statements WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching cap statement by ID', { error: error.message, id });
      throw error;
    }
  }

  async create(capStatement) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO cap_statements (title, description, status, created_by, created_by_user_id, template_id, generated_content, edited_content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          capStatement.title,
          capStatement.description || null,
          capStatement.status || 'draft',
          capStatement.created_by || 'system',
          capStatement.created_by_user_id || null,
          capStatement.template_id || null,
          capStatement.generated_content || null,
          capStatement.edited_content || null
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating cap statement', { error: error.message });
      throw error;
    }
  }

  async update(id, capStatement) {
    try {
      const updates = [];
      const params = [];

      if (capStatement.title !== undefined) {
        updates.push('title = ?');
        params.push(capStatement.title);
      }
      if (capStatement.description !== undefined) {
        updates.push('description = ?');
        params.push(capStatement.description);
      }
      if (capStatement.status !== undefined) {
        updates.push('status = ?');
        params.push(capStatement.status);
      }
      if (capStatement.edited_content !== undefined) {
        updates.push('edited_content = ?');
        params.push(capStatement.edited_content);
      }

      if (updates.length === 0) {
        return false;
      }

      params.push(id);
      const [result] = await pool.execute(
        `UPDATE cap_statements SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating cap statement', { error: error.message, id });
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM cap_statements WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting cap statement', { error: error.message, id });
      throw error;
    }
  }

  async createVersion(version) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO cap_statement_versions 
         (cap_statement_id, version_number, version_name, content, settings, selected_deal_ids, selected_award_ids, selected_lawyer_ids)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          version.cap_statement_id,
          version.version_number,
          version.version_name || null,
          version.content,
          JSON.stringify(version.settings || {}),
          JSON.stringify(version.selected_deal_ids || []),
          JSON.stringify(version.selected_award_ids || []),
          JSON.stringify(version.selected_lawyer_ids || [])
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating cap statement version', { error: error.message });
      throw error;
    }
  }

  async getVersionsByCapStatementId(capStatementId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cap_statement_versions WHERE cap_statement_id = ? ORDER BY version_number DESC',
        [capStatementId]
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching versions', { error: error.message, capStatementId });
      throw error;
    }
  }

  async getLatestVersion(capStatementId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cap_statement_versions WHERE cap_statement_id = ? ORDER BY version_number DESC LIMIT 1',
        [capStatementId]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching latest version', { error: error.message, capStatementId });
      throw error;
    }
  }

  async getVersionById(versionId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cap_statement_versions WHERE id = ?',
        [versionId]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching version by ID', { error: error.message, versionId });
      throw error;
    }
  }

  async updateVersion(versionId, version) {
    try {
      const updates = [];
      const params = [];

      if (version.content !== undefined) {
        updates.push('content = ?');
        params.push(version.content);
      }
      if (version.version_name !== undefined) {
        updates.push('version_name = ?');
        params.push(version.version_name || null);
      }
      if (version.settings !== undefined) {
        updates.push('settings = ?');
        params.push(JSON.stringify(version.settings || {}));
      }
      if (version.selected_deal_ids !== undefined) {
        updates.push('selected_deal_ids = ?');
        params.push(JSON.stringify(version.selected_deal_ids || []));
      }
      if (version.selected_award_ids !== undefined) {
        updates.push('selected_award_ids = ?');
        params.push(JSON.stringify(version.selected_award_ids || []));
      }
      if (version.selected_lawyer_ids !== undefined) {
        updates.push('selected_lawyer_ids = ?');
        params.push(JSON.stringify(version.selected_lawyer_ids || []));
      }

      if (updates.length === 0) {
        return false;
      }

      params.push(versionId);
      const [result] = await pool.execute(
        `UPDATE cap_statement_versions SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating cap statement version', { error: error.message, versionId });
      throw error;
    }
  }
}

export default new CapStatementRepository();
