/**
 * Template Definition Repository
 * 
 * Handles CRUD operations for structured template definitions stored in:
 * - template_definitions: Immutable structure (JSON schema)
 * - template_content: Editable content values
 * - template_versions: Version history
 */

import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

class TemplateDefinitionRepository {
  /**
   * Find all template definitions (active only by default)
   */
  async findAll(includeInactive = false) {
    try {
      let query = 'SELECT * FROM template_definitions';
      const params = [];
      
      if (!includeInactive) {
        query += ' WHERE is_active = TRUE';
      }
      
      query += ' ORDER BY name ASC, version DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error fetching template definitions', { error: error.message });
      throw error;
    }
  }

  /**
   * Find template definition by ID
   * Returns definition with parsed structure_json and styles_json
   */
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM template_definitions WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const definition = rows[0];
      
      // Parse JSON fields
      try {
        definition.structure = JSON.parse(definition.structure_json);
        definition.styles = definition.styles_json ? JSON.parse(definition.styles_json) : null;
      } catch (parseError) {
        logger.warn('Error parsing JSON in template definition', { id, error: parseError.message });
        definition.structure = null;
        definition.styles = null;
      }
      
      return definition;
    } catch (error) {
      logger.error('Error fetching template definition by ID', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Find template definition by name (gets latest version if multiple exist)
   */
  async findByName(name) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM template_definitions WHERE name = ? AND is_active = TRUE ORDER BY version DESC LIMIT 1',
        [name]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const definition = rows[0];
      
      // Parse JSON fields
      try {
        definition.structure = JSON.parse(definition.structure_json);
        definition.styles = definition.styles_json ? JSON.parse(definition.styles_json) : null;
      } catch (parseError) {
        logger.warn('Error parsing JSON in template definition', { name, error: parseError.message });
        definition.structure = null;
        definition.styles = null;
      }
      
      return definition;
    } catch (error) {
      logger.error('Error fetching template definition by name', { error: error.message, name });
      throw error;
    }
  }

  /**
   * Create new template definition
   * structure and styles should be objects, will be stringified to JSON
   */
  async create(definition) {
    try {
      const structureJson = typeof definition.structure === 'string' 
        ? definition.structure 
        : JSON.stringify(definition.structure || {});
      
      const stylesJson = definition.styles 
        ? (typeof definition.styles === 'string' 
            ? definition.styles 
            : JSON.stringify(definition.styles))
        : null;
      
      const [result] = await pool.execute(
        `INSERT INTO template_definitions 
         (name, description, template_type, total_pages, structure_json, styles_json, version, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          definition.name,
          definition.description || null,
          definition.template_type || 'simple',
          definition.total_pages || 1,
          structureJson,
          stylesJson,
          definition.version || 1,
          definition.is_active !== undefined ? definition.is_active : true
        ]
      );
      
      return result.insertId;
    } catch (error) {
      logger.error('Error creating template definition', { error: error.message });
      throw error;
    }
  }

  /**
   * Update template definition (creates new version if structure changes)
   * For structure updates, increments version and creates entry in template_versions
   */
  async update(id, definition, userId = null) {
    try {
      // Get full current record first for fallback values
      const [currentRowsFull] = await pool.execute(
        'SELECT * FROM template_definitions WHERE id = ?',
        [id]
      );
      
      if (currentRowsFull.length === 0) {
        throw new Error('Template definition not found');
      }
      
      const currentFull = currentRowsFull[0];
      const current = {
        version: currentFull.version,
        structure_json: currentFull.structure_json
      };
      
      const newStructureJson = definition.structure
        ? (typeof definition.structure === 'string' 
            ? definition.structure 
            : JSON.stringify(definition.structure))
        : current.structure_json;
      
      // Check if structure changed
      const structureChanged = newStructureJson !== current.structure_json;
      const newVersion = structureChanged ? current.version + 1 : current.version;
      
      // If structure changed, save current version to template_versions
      if (structureChanged) {
        await pool.execute(
          `INSERT INTO template_versions 
           (template_definition_id, version_number, structure_json, styles_json, created_by_user_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            current.version,
            current.structure_json,
            currentFull.styles_json || null,
            userId
          ]
        );
      }
      
      const stylesJson = definition.styles !== undefined
        ? (typeof definition.styles === 'string' 
            ? definition.styles 
            : (definition.styles ? JSON.stringify(definition.styles) : null))
        : currentFull.styles_json;
      
      // Use provided values or fall back to current values
      const name = definition.name !== undefined ? String(definition.name) : currentFull.name;
      const description = definition.description !== undefined 
        ? (definition.description !== null ? String(definition.description) : null)
        : currentFull.description;
      const templateType = definition.template_type !== undefined 
        ? String(definition.template_type) 
        : currentFull.template_type;
      const totalPages = definition.total_pages !== undefined 
        ? Number(definition.total_pages) 
        : currentFull.total_pages;
      const isActive = definition.is_active !== undefined 
        ? Boolean(definition.is_active) 
        : currentFull.is_active;
      
      // Build parameters array ensuring no undefined values
      const updateParams = [
        name,
        description,
        templateType,
        totalPages,
        newStructureJson,
        stylesJson,
        newVersion,
        isActive,
        id
      ];
      
      // Validate no undefined values
      const paramNames = ['name', 'description', 'template_type', 'total_pages', 
                         'structure_json', 'styles_json', 'version', 'is_active', 'id'];
      for (let i = 0; i < updateParams.length; i++) {
        if (updateParams[i] === undefined) {
          throw new Error(`Parameter ${paramNames[i]} is undefined in updateTemplateDefinition`);
        }
      }
      
      // Update template definition
      const [result] = await pool.execute(
        `UPDATE template_definitions 
         SET name = ?, description = ?, template_type = ?, total_pages = ?, 
             structure_json = ?, styles_json = ?, version = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        updateParams
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating template definition', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Soft delete template definition (set is_active = FALSE)
   */
  async delete(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE template_definitions SET is_active = FALSE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting template definition', { error: error.message, id });
      throw error;
    }
  }
}

export default new TemplateDefinitionRepository();