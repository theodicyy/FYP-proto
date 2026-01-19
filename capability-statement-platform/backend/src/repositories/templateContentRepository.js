/**
 * Template Content Repository
 * 
 * Handles CRUD operations for editable template content stored in template_content table
 */

import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class TemplateContentRepository {
  /**
   * Find all content entries for a template definition
   */
  async findByTemplateId(templateDefinitionId, filters = {}) {
    try {
      let query = `
        SELECT * FROM template_content 
        WHERE template_definition_id = ?
      `;
      const params = [templateDefinitionId];
      
      if (filters.page_number !== undefined) {
        query += ' AND page_number = ?';
        params.push(filters.page_number);
      }
      
      if (filters.section_id) {
        query += ' AND section_id = ?';
        params.push(filters.section_id);
      }
      
      if (filters.is_enabled !== undefined) {
        query += ' AND is_enabled = ?';
        params.push(filters.is_enabled);
      }
      
      query += ' ORDER BY page_number, section_id, element_id';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching template content', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Find content by template ID, page, section, and element
   */
  async findOne(templateDefinitionId, pageNumber, sectionId, elementId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM template_content 
         WHERE template_definition_id = ? 
           AND page_number = ? 
           AND section_id = ? 
           AND element_id = ?`,
        [templateDefinitionId, pageNumber, sectionId, elementId]
      );
      
      return rows[0] || null;
    } catch (error) {
      logger.error('Error fetching template content by key', { 
        error: error.message,
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId
      });
      throw error;
    }
  }

  /**
   * Create or update content entry (upsert)
   * Uses INSERT ... ON DUPLICATE KEY UPDATE
   */
  async upsert(content) {
    try {
      // Validate required fields
      if (content.template_definition_id === undefined || content.template_definition_id === null) {
        throw new Error('template_definition_id is required');
      }
      if (content.page_number === undefined || content.page_number === null) {
        throw new Error('page_number is required');
      }
      if (!content.section_id) {
        throw new Error('section_id is required');
      }
      if (!content.element_id) {
        throw new Error('element_id is required');
      }
      
      // Process metadata - convert to JSON string or null
      let metadataJson = null;
      if (content.metadata !== null && content.metadata !== undefined) {
        metadataJson = typeof content.metadata === 'string' 
          ? content.metadata 
          : JSON.stringify(content.metadata);
      }
      
      // Ensure all values are properly set (no undefined) - explicitly convert to proper types
      const templateDefinitionId = Number(content.template_definition_id);
      const pageNumber = Number(content.page_number);
      const sectionId = String(content.section_id);
      const elementId = String(content.element_id);
      const contentType = String(content.content_type || 'text');
      const contentValue = content.content_value !== undefined && content.content_value !== null 
        ? String(content.content_value) 
        : '';
      const isEnabled = content.is_enabled !== undefined ? Boolean(content.is_enabled) : true;
      
      // Final validation - ensure no undefined values
      const params = [
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId,
        contentType,
        contentValue,
        isEnabled,
        metadataJson
      ];
      
      // Aggressive check: Verify every single parameter is NOT undefined
      const paramNames = ['template_definition_id', 'page_number', 'section_id', 'element_id', 
                         'content_type', 'content_value', 'is_enabled', 'metadata'];
      
      // Check each parameter explicitly
      for (let i = 0; i < params.length; i++) {
        if (params[i] === undefined) {
          logger.error('CRITICAL: Undefined parameter detected', {
            parameterIndex: i,
            parameterName: paramNames[i],
            allParams: params,
            inputContent: {
              template_definition_id: content.template_definition_id,
              page_number: content.page_number,
              section_id: content.section_id,
              element_id: content.element_id,
              content_type: content.content_type,
              content_value: content.content_value,
              is_enabled: content.is_enabled,
              metadata: content.metadata
            }
          });
          throw new Error(`Parameter "${paramNames[i]}" (index ${i}) is undefined. Value: ${params[i]}`);
        }
      }
      
      // Double-check: Create a new array with explicit null conversion for safety
      const safeParams = [];
      for (let i = 0; i < params.length; i++) {
        if (params[i] === undefined) {
          logger.error(`Parameter ${i} (${paramNames[i]}) is undefined!`, { 
            value: params[i], 
            type: typeof params[i],
            allParams: params
          });
          throw new Error(`Parameter ${paramNames[i]} is undefined`);
        }
        // Explicitly convert undefined to null (shouldn't happen due to check above, but safety net)
        safeParams.push(params[i] === undefined ? null : params[i]);
      }
      
      logger.info('Executing template content upsert with validated parameters', {
        params: safeParams.map((p, i) => ({
          name: paramNames[i],
          value: p,
          type: typeof p
        }))
      });
      
      const [result] = await pool.execute(
        `INSERT INTO template_content 
         (template_definition_id, page_number, section_id, element_id, 
          content_type, content_value, is_enabled, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         content_type = VALUES(content_type),
         content_value = VALUES(content_value),
         is_enabled = VALUES(is_enabled),
         metadata = VALUES(metadata),
         updated_at = CURRENT_TIMESTAMP`,
        safeParams
      );
      
      // Return the ID (insertId if new, or existing ID if updated)
      return result.insertId || content.id;
    } catch (error) {
      logger.error('Error upserting template content', { 
        error: error.message,
        stack: error.stack,
        content: {
          template_definition_id: content.template_definition_id,
          page_number: content.page_number,
          section_id: content.section_id,
          element_id: content.element_id,
          content_type: content.content_type,
          has_content_value: content.content_value !== undefined,
          is_enabled: content.is_enabled
        }
      });
      throw error;
    }
  }

  /**
   * Update content value only
   */
  async updateContent(templateDefinitionId, pageNumber, sectionId, elementId, contentValue) {
    try {
      const [result] = await pool.execute(
        `UPDATE template_content 
         SET content_value = ?, updated_at = CURRENT_TIMESTAMP
         WHERE template_definition_id = ? 
           AND page_number = ? 
           AND section_id = ? 
           AND element_id = ?`,
        [contentValue, templateDefinitionId, pageNumber, sectionId, elementId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating template content', { 
        error: error.message,
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId
      });
      throw error;
    }
  }

  /**
   * Update multiple content entries (batch update)
   * contentUpdates: Array of { page_number, section_id, element_id, content_value }
   */
  async updateBatch(templateDefinitionId, contentUpdates) {
    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        for (const update of contentUpdates) {
          await connection.execute(
            `UPDATE template_content 
             SET content_value = ?, 
                 content_type = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE template_definition_id = ? 
               AND page_number = ? 
               AND section_id = ? 
               AND element_id = ?`,
            [
              update.content_value,
              update.content_type || 'text',
              templateDefinitionId,
              update.page_number,
              update.section_id,
              update.element_id
            ]
          );
        }
        
        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('Error batch updating template content', { 
        error: error.message,
        templateDefinitionId
      });
      throw error;
    }
  }

  /**
   * Enable/disable content entry
   */
  async setEnabled(templateDefinitionId, pageNumber, sectionId, elementId, enabled) {
    try {
      const [result] = await pool.execute(
        `UPDATE template_content 
         SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP
         WHERE template_definition_id = ? 
           AND page_number = ? 
           AND section_id = ? 
           AND element_id = ?`,
        [enabled, templateDefinitionId, pageNumber, sectionId, elementId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error setting content enabled status', { 
        error: error.message,
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId
      });
      throw error;
    }
  }

  /**
   * Delete content entry (hard delete)
   */
  async delete(templateDefinitionId, pageNumber, sectionId, elementId) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM template_content 
         WHERE template_definition_id = ? 
           AND page_number = ? 
           AND section_id = ? 
           AND element_id = ?`,
        [templateDefinitionId, pageNumber, sectionId, elementId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting template content', { 
        error: error.message,
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId
      });
      throw error;
    }
  }
}

export default new TemplateContentRepository();
