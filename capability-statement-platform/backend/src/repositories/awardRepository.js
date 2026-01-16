import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class AwardRepository {
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM awards WHERE 1=1';
      const params = [];

      if (filters.industry) {
        query += ' AND industry = ?';
        params.push(filters.industry);
      }

      if (filters.practice_group) {
        query += ' AND practice_group = ?';
        params.push(filters.practice_group);
      }

      if (filters.award_year) {
        query += ' AND award_year = ?';
        params.push(filters.award_year);
      }

      if (filters.source_system) {
        query += ' AND source_system = ?';
        params.push(filters.source_system);
      }

      query += ' ORDER BY award_year DESC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching awards', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM awards WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching award by ID', { error: error.message, id });
      throw error;
    }
  }

  async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    try {
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT * FROM awards WHERE id IN (${placeholders})`,
        ids
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching awards by IDs', { error: error.message, ids });
      throw error;
    }
  }

  async create(award) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO awards (award_name, awarding_organization, award_year, category, practice_group, industry, description, source_system)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          award.award_name,
          award.awarding_organization || null,
          award.award_year || null,
          award.category || null,
          award.practice_group || null,
          award.industry || null,
          award.description || null,
          award.source_system || 'admin'
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating award', { error: error.message });
      throw error;
    }
  }

  async update(id, award) {
    try {
      const updates = [];
      const params = [];

      if (award.award_name !== undefined) {
        updates.push('award_name = ?');
        params.push(award.award_name);
      }
      if (award.awarding_organization !== undefined) {
        updates.push('awarding_organization = ?');
        params.push(award.awarding_organization);
      }
      if (award.award_year !== undefined) {
        updates.push('award_year = ?');
        params.push(award.award_year);
      }
      if (award.category !== undefined) {
        updates.push('category = ?');
        params.push(award.category);
      }
      if (award.practice_group !== undefined) {
        updates.push('practice_group = ?');
        params.push(award.practice_group);
      }
      if (award.industry !== undefined) {
        updates.push('industry = ?');
        params.push(award.industry);
      }
      if (award.description !== undefined) {
        updates.push('description = ?');
        params.push(award.description);
      }
      if (award.source_system !== undefined) {
        updates.push('source_system = ?');
        params.push(award.source_system);
      }

      if (updates.length === 0) {
        return false;
      }

      params.push(id);
      const [result] = await pool.execute(
        `UPDATE awards SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating award', { error: error.message, id });
      throw error;
    }
  }

  async delete(id, userId = null) {
    try {
      // Check if soft delete columns exist
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'awards' 
         AND COLUMN_NAME = 'deleted_at'`
      );

      if (columns.length > 0) {
        // Soft delete
        const [result] = await pool.execute(
          `UPDATE awards SET deleted_at = NOW(), deleted_by_user_id = ? WHERE id = ?`,
          [userId, id]
        );
        return result.affectedRows > 0;
      } else {
        // Hard delete (check for references)
        const [refs] = await pool.execute(
          'SELECT COUNT(*) as count FROM award_lawyers WHERE award_id = ?',
          [id]
        );
        if (refs[0].count > 0) {
          const error = new Error('Cannot delete award: has associated lawyers');
          error.statusCode = 400;
          throw error;
        }

        const [result] = await pool.execute('DELETE FROM awards WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
    } catch (error) {
      logger.error('Error deleting award', { error: error.message, id });
      throw error;
    }
  }
}

export default new AwardRepository();
