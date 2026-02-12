import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class DealRepository {
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM deals WHERE 1=1';
      const params = [];

      if (filters.industry) {
        query += ' AND industry = ?';
        params.push(filters.industry);
      }

      if (filters.practice_group) {
        query += ' AND practice_group = ?';
        params.push(filters.practice_group);
      }

      if (filters.deal_year) {
        query += ' AND deal_year = ?';
        params.push(filters.deal_year);
      }

      if (filters.source_system) {
        query += ' AND source_system = ?';
        params.push(filters.source_system);
      }

      query += ' ORDER BY deal_year DESC, deal_value DESC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching deals', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM deals WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching deal by ID', { error: error.message, id });
      throw error;
    }
  }

  async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    try {
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT * FROM deals WHERE id IN (${placeholders})`,
        ids
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching deals by IDs', { error: error.message, ids });
      throw error;
    }
  }

  async create(deal) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO deals (deal_name, client_name, deal_value, deal_currency, industry, practice_group, deal_year, deal_description, deal_type, source_system)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deal.deal_name,
          deal.client_name || null,
          deal.deal_value || null,
          deal.deal_currency || 'USD',
          deal.industry || null,
          deal.practice_group || null,
          deal.deal_year || null,
          deal.deal_description || null,
          deal.deal_type || null,
          deal.source_system || 'admin'
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating deal', { error: error.message });
      throw error;
    }
  }

  async update(id, deal) {
    try {
      const updates = [];
      const params = [];

      if (deal.deal_name !== undefined) {
        updates.push('deal_name = ?');
        params.push(deal.deal_name);
      }
      if (deal.client_name !== undefined) {
        updates.push('client_name = ?');
        params.push(deal.client_name);
      }
      if (deal.deal_value !== undefined) {
        updates.push('deal_value = ?');
        params.push(deal.deal_value);
      }
      if (deal.deal_currency !== undefined) {
        updates.push('deal_currency = ?');
        params.push(deal.deal_currency);
      }
      if (deal.industry !== undefined) {
        updates.push('industry = ?');
        params.push(deal.industry);
      }
      if (deal.practice_group !== undefined) {
        updates.push('practice_group = ?');
        params.push(deal.practice_group);
      }
      if (deal.deal_year !== undefined) {
        updates.push('deal_year = ?');
        params.push(deal.deal_year);
      }
      if (deal.deal_description !== undefined) {
        updates.push('deal_description = ?');
        params.push(deal.deal_description);
      }
      if (deal.deal_type !== undefined) {
        updates.push('deal_type = ?');
        params.push(deal.deal_type);
      }
      if (deal.source_system !== undefined) {
        updates.push('source_system = ?');
        params.push(deal.source_system);
      }

      if (updates.length === 0) {
        return false;
      }

      params.push(id);
      const [result] = await pool.execute(
        `UPDATE deals SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating deal', { error: error.message, id });
      throw error;
    }
  }

  async delete(id, userId = null) {
    try {
      // Check if soft delete columns exist
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'deals' 
         AND COLUMN_NAME = 'deleted_at'`
      );

      if (columns.length > 0) {
        // Soft delete
        const [result] = await pool.execute(
          `UPDATE deals SET deleted_at = NOW(), deleted_by_user_id = ? WHERE id = ?`,
          [userId, id]
        );
        return result.affectedRows > 0;
      } else {
        // Hard delete (check for references)
        const [refs] = await pool.execute(
          'SELECT COUNT(*) as count FROM deal_lawyers WHERE deal_id = ?',
          [id]
        );
        if (refs[0].count > 0) {
          const error = new Error('Cannot delete deal: has associated lawyers');
          error.statusCode = 400;
          throw error;
        }

        const [result] = await pool.execute('DELETE FROM deals WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
    } catch (error) {
      logger.error('Error deleting deal', { error: error.message, id });
      throw error;
    }
  }

  async findByIds(ids = []) {
  if (!ids.length) return []
  const placeholders = ids.map(() => '?').join(',')
  const query = `SELECT * FROM lawyers WHERE id IN (${placeholders})`
  const [rows] = await pool.execute(query, ids)
  return rows
}

}

export default new DealRepository();
