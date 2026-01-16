import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class TemplateRepository {
  async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM templates ORDER BY name ASC'
      );
      return rows;
    } catch (error) {
      logger.error('Error fetching templates', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM templates WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching template by ID', { error: error.message, id });
      throw error;
    }
  }

  async create(template) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO templates (name, description, content)
         VALUES (?, ?, ?)`,
        [
          template.name,
          template.description || null,
          template.content
        ]
      );
      return result.insertId;
    } catch (error) {
      logger.error('Error creating template', { error: error.message });
      throw error;
    }
  }

  async update(id, template) {
    try {
      const [result] = await pool.execute(
        `UPDATE templates 
         SET name = ?, description = ?, content = ?
         WHERE id = ?`,
        [
          template.name,
          template.description || null,
          template.content,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating template', { error: error.message, id });
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM templates WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting template', { error: error.message, id });
      throw error;
    }
  }
}

export default new TemplateRepository();
