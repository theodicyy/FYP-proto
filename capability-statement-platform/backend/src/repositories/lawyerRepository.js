import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class LawyerRepository {
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM lawyers WHERE 1=1';
      const params = [];

      if (filters.practice_group) {
        query += ' AND practice_group = ?';
        params.push(filters.practice_group);
      }

      query += ' ORDER BY last_name, first_name';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching lawyers', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lawyers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching lawyer by ID', { error: error.message, id });
      throw error;
    }
  }

  async findByDealId(dealId) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, dl.role 
         FROM lawyers l
         INNER JOIN deal_lawyers dl ON l.id = dl.lawyer_id
         WHERE dl.deal_id = ?`,
        [dealId]
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching lawyers by deal ID', { error: error.message, dealId });
      throw error;
    }
  }

  async create(lawyer) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO lawyers (first_name, last_name, email, practice_group, title, designation, lawyer_designation, phone, qualifications, admissions, bio, years_experience)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lawyer.first_name,
          lawyer.last_name,
          lawyer.email || null,
          lawyer.practice_group || null,
          lawyer.title || null,
          lawyer.designation || null,
          lawyer.lawyer_designation || null,
          lawyer.phone || null,
          lawyer.qualifications || null,
          lawyer.admissions || null,
          lawyer.bio || null,
          lawyer.years_experience ?? null
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating lawyer', { error: error.message });
      throw error;
    }
  }

  async update(id, lawyer) {
    try {
      const updates = [];
      const params = [];

      if (lawyer.first_name !== undefined) {
        updates.push('first_name = ?');
        params.push(lawyer.first_name);
      }
      if (lawyer.last_name !== undefined) {
        updates.push('last_name = ?');
        params.push(lawyer.last_name);
      }
      if (lawyer.email !== undefined) {
        updates.push('email = ?');
        params.push(lawyer.email);
      }
      if (lawyer.practice_group !== undefined) {
        updates.push('practice_group = ?');
        params.push(lawyer.practice_group);
      }
      if (lawyer.title !== undefined) {
        updates.push('title = ?');
        params.push(lawyer.title);
      }
      if (lawyer.designation !== undefined) {
        updates.push('designation = ?');
        params.push(lawyer.designation);
      }
      if (lawyer.lawyer_designation !== undefined) {
        updates.push('lawyer_designation = ?');
        params.push(lawyer.lawyer_designation);
      }
      if (lawyer.phone !== undefined) {
        updates.push('phone = ?');
        params.push(lawyer.phone);
      }
      if (lawyer.qualifications !== undefined) {
        updates.push('qualifications = ?');
        params.push(lawyer.qualifications);
      }
      if (lawyer.admissions !== undefined) {
        updates.push('admissions = ?');
        params.push(lawyer.admissions);
      }
      if (lawyer.bio !== undefined) {
        updates.push('bio = ?');
        params.push(lawyer.bio);
      }
      if (lawyer.years_experience !== undefined) {
        updates.push('years_experience = ?');
        params.push(lawyer.years_experience);
      }

      if (updates.length === 0) {
        return false;
      }

      params.push(id);
      const [result] = await pool.execute(
        `UPDATE lawyers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating lawyer', { error: error.message, id });
      throw error;
    }
  }

  async delete(id, userId = null) {
    try {
      // Check if soft delete columns exist (from RBAC migration)
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'lawyers' 
         AND COLUMN_NAME = 'deleted_at'`
      );

      if (columns.length > 0) {
        // Soft delete
        const [result] = await pool.execute(
          `UPDATE lawyers SET deleted_at = NOW(), deleted_by_user_id = ? WHERE id = ?`,
          [userId, id]
        );
        return result.affectedRows > 0;
      } else {
        // Hard delete (check for references first)
        // Check deal_lawyers references
        const [dealRefs] = await pool.execute(
          'SELECT COUNT(*) as count FROM deal_lawyers WHERE lawyer_id = ?',
          [id]
        );
        if (dealRefs[0].count > 0) {
          const error = new Error('Cannot delete lawyer: referenced in deals');
          error.statusCode = 400;
          throw error;
        }

        // Check lawyer_awards references
        const [awardRefs] = await pool.execute(
          'SELECT COUNT(*) as count FROM lawyer_awards WHERE lawyer_id = ?',
          [id]
        );
        if (awardRefs[0].count > 0) {
          const error = new Error('Cannot delete lawyer: referenced in awards');
          error.statusCode = 400;
          throw error;
        }

        const [result] = await pool.execute('DELETE FROM lawyers WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
    } catch (error) {
      logger.error('Error deleting lawyer', { error: error.message, id });
      throw error;
    }
  }

  async findAllWithSoftDelete(filters = {}) {
    try {
      let query = 'SELECT * FROM lawyers WHERE 1=1';
      const params = [];

      // Exclude soft-deleted by default
      query += ' AND (deleted_at IS NULL OR deleted_at = 0)';

      if (filters.practice_group) {
        query += ' AND practice_group = ?';
        params.push(filters.practice_group);
      }

      if (filters.include_deleted) {
        query = query.replace('AND (deleted_at IS NULL OR deleted_at = 0)', '');
      }

      query += ' ORDER BY last_name, first_name';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      // If deleted_at column doesn't exist, fall back to regular findAll
      return this.findAll(filters);
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



export default new LawyerRepository();
