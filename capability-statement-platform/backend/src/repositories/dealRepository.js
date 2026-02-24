import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class DealRepository {
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM deals WHERE 1=1';
      const params = [];

      if (filters.deal_industry) {
        query += ' AND deal_industry = ?';
        params.push(filters.deal_industry);
      }

      if (filters.deal_date) {
        query += ' AND deal_date = ?';
        params.push(filters.deal_date);
      }

      query += ' ORDER BY deal_date DESC, deal_value DESC';

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

  async findDistinctIndustries() {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT deal_industry FROM deals
         WHERE deal_industry IS NOT NULL AND TRIM(deal_industry) != ''
         ORDER BY deal_industry ASC`
      );
      return rows.map((r) => r.deal_industry);
    } catch (error) {
      logger.error('Error fetching distinct deal industries', { error: error.message });
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
        `INSERT INTO deals (deal_name, client_name, deal_summary, significant_features, notability, notable_reason, acting_for, deal_value, currency, jurisdiction, deal_date, signing_date, completion_date, past_clients, deal_industry, remarks, partner_approval, partner_initial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deal.deal_name,
          deal.client_name || null,
          deal.deal_summary || null,
          deal.significant_features || null,
          deal.notability || null,
          deal.notable_reason || null,
          deal.acting_for || null,
          deal.deal_value ?? null,
          deal.currency || null,
          deal.jurisdiction || null,
          deal.deal_date || null,
          deal.signing_date || null,
          deal.completion_date || null,
          deal.past_clients || null,
          deal.deal_industry || null,
          deal.remarks || null,
          deal.partner_approval || null,
          deal.partner_initial || null
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
      if (deal.deal_summary !== undefined) {
        updates.push('deal_summary = ?');
        params.push(deal.deal_summary);
      }
      if (deal.significant_features !== undefined) {
        updates.push('significant_features = ?');
        params.push(deal.significant_features);
      }
      if (deal.notability !== undefined) {
        updates.push('notability = ?');
        params.push(deal.notability);
      }
      if (deal.notable_reason !== undefined) {
        updates.push('notable_reason = ?');
        params.push(deal.notable_reason);
      }
      if (deal.acting_for !== undefined) {
        updates.push('acting_for = ?');
        params.push(deal.acting_for);
      }
      if (deal.deal_value !== undefined) {
        updates.push('deal_value = ?');
        params.push(deal.deal_value);
      }
      if (deal.currency !== undefined) {
        updates.push('currency = ?');
        params.push(deal.currency);
      }
      if (deal.jurisdiction !== undefined) {
        updates.push('jurisdiction = ?');
        params.push(deal.jurisdiction);
      }
      if (deal.deal_date !== undefined) {
        updates.push('deal_date = ?');
        params.push(deal.deal_date);
      }
      if (deal.signing_date !== undefined) {
        updates.push('signing_date = ?');
        params.push(deal.signing_date);
      }
      if (deal.completion_date !== undefined) {
        updates.push('completion_date = ?');
        params.push(deal.completion_date);
      }
      if (deal.past_clients !== undefined) {
        updates.push('past_clients = ?');
        params.push(deal.past_clients);
      }
      if (deal.deal_industry !== undefined) {
        updates.push('deal_industry = ?');
        params.push(deal.deal_industry);
      }
      if (deal.remarks !== undefined) {
        updates.push('remarks = ?');
        params.push(deal.remarks);
      }
      if (deal.partner_approval !== undefined) {
        updates.push('partner_approval = ?');
        params.push(deal.partner_approval);
      }
      if (deal.partner_initial !== undefined) {
        updates.push('partner_initial = ?');
        params.push(deal.partner_initial);
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
        // Hard delete; deal_lawyers and deal_awards use ON DELETE CASCADE
        const [result] = await pool.execute('DELETE FROM deals WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
    } catch (error) {
      logger.error('Error deleting deal', { error: error.message, id });
      throw error;
    }
  }

}

export default new DealRepository();
