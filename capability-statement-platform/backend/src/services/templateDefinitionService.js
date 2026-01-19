/**
 * Template Definition Service
 * 
 * Business logic layer for structured template definitions
 * Uses TemplateDefinitionRepository and TemplateContentRepository
 */

import templateDefinitionRepository from '../repositories/templateDefinitionRepository.js';
import templateContentRepository from '../repositories/templateContentRepository.js';
import { logger } from '../utils/logger.js';

class TemplateDefinitionService {
  /**
   * Get all template definitions
   */
  async getTemplateDefinitions(includeInactive = false) {
    try {
      const definitions = await templateDefinitionRepository.findAll(includeInactive);
      logger.info('Retrieved template definitions', { count: definitions.length });
      return definitions;
    } catch (error) {
      logger.error('Error fetching template definitions in service', { error: error.message });
      throw error;
    }
  }

  /**
   * Get template definition by ID with parsed structure
   */
  async getTemplateDefinitionById(id) {
    try {
      const definition = await templateDefinitionRepository.findById(id);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Retrieved template definition by ID', { id, name: definition.name });
      return definition;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error fetching template definition by ID in service', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get template definition by name
   */
  async getTemplateDefinitionByName(name) {
    try {
      const definition = await templateDefinitionRepository.findByName(name);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Retrieved template definition by name', { name });
      return definition;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error fetching template definition by name in service', { error: error.message, name });
      throw error;
    }
  }

  /**
   * Get template definition with all content entries
   */
  async getTemplateDefinitionWithContent(id) {
    try {
      const definition = await this.getTemplateDefinitionById(id);
      const content = await templateContentRepository.findByTemplateId(id);
      
      return {
        ...definition,
        content: content
      };
    } catch (error) {
      logger.error('Error fetching template definition with content', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get content for a template definition (optionally filtered by page)
   */
  async getTemplateContent(templateDefinitionId, filters = {}) {
    try {
      const content = await templateContentRepository.findByTemplateId(templateDefinitionId, filters);
      logger.info('Retrieved template content', { 
        templateDefinitionId, 
        count: content.length,
        filters 
      });
      return content;
    } catch (error) {
      logger.error('Error fetching template content in service', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Create new template definition
   */
  async createTemplateDefinition(data) {
    try {
      // Validation
      if (!data.name) {
        const error = new Error('Template name is required');
        error.statusCode = 400;
        throw error;
      }

      if (!data.structure) {
        const error = new Error('Template structure is required');
        error.statusCode = 400;
        throw error;
      }

      // Create template definition
      const id = await templateDefinitionRepository.create({
        name: data.name,
        description: data.description,
        template_type: data.template_type || 'multipage',
        total_pages: data.total_pages || 1,
        structure: data.structure,
        styles: data.styles,
        version: data.version || 1,
        is_active: data.is_active !== undefined ? data.is_active : true
      });

      logger.info('Created template definition', { id, name: data.name });
      return id;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error creating template definition in service', { error: error.message });
      throw error;
    }
  }

  /**
   * Update template definition (creates new version if structure changes)
   */
  async updateTemplateDefinition(id, data, userId = null) {
    try {
      // Check if template exists
      const existing = await templateDefinitionRepository.findById(id);
      if (!existing) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }

      // Prepare update data (only include provided fields)
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.template_type !== undefined) updateData.template_type = data.template_type;
      if (data.total_pages !== undefined) updateData.total_pages = data.total_pages;
      if (data.structure !== undefined) updateData.structure = data.structure;
      if (data.styles !== undefined) updateData.styles = data.styles;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const updated = await templateDefinitionRepository.update(id, updateData, userId);
      if (!updated) {
        const error = new Error('Template definition update failed');
        error.statusCode = 500;
        throw error;
      }

      logger.info('Updated template definition', { id, structureChanged: data.structure !== undefined });
      return updated;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error updating template definition in service', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update template content (single entry)
   */
  async updateTemplateContent(templateDefinitionId, pageNumber, sectionId, elementId, contentValue) {
    try {
      // Verify template exists
      const definition = await templateDefinitionRepository.findById(templateDefinitionId);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }

      const updated = await templateContentRepository.updateContent(
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId,
        contentValue
      );

      if (!updated) {
        const error = new Error('Content entry not found or update failed');
        error.statusCode = 404;
        throw error;
      }

      logger.info('Updated template content', { 
        templateDefinitionId, 
        pageNumber, 
        sectionId, 
        elementId 
      });
      return updated;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error updating template content in service', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Update multiple template content entries (batch update)
   */
  async updateTemplateContentBatch(templateDefinitionId, contentUpdates) {
    try {
      // Validation
      if (!Array.isArray(contentUpdates) || contentUpdates.length === 0) {
        const error = new Error('Content updates must be a non-empty array');
        error.statusCode = 400;
        throw error;
      }

      // Validate each update has required fields
      for (const update of contentUpdates) {
        if (!update.page_number || !update.section_id || !update.element_id || update.content_value === undefined) {
          const error = new Error('Each content update must have page_number, section_id, element_id, and content_value');
          error.statusCode = 400;
          throw error;
        }
      }

      // Verify template exists
      const definition = await templateDefinitionRepository.findById(templateDefinitionId);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }

      const updated = await templateContentRepository.updateBatch(templateDefinitionId, contentUpdates);
      
      logger.info('Batch updated template content', { 
        templateDefinitionId, 
        updateCount: contentUpdates.length 
      });
      return updated;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error batch updating template content in service', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Enable/disable template content entry
   */
  async setTemplateContentEnabled(templateDefinitionId, pageNumber, sectionId, elementId, enabled) {
    try {
      // Verify template exists
      const definition = await templateDefinitionRepository.findById(templateDefinitionId);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }

      const updated = await templateContentRepository.setEnabled(
        templateDefinitionId,
        pageNumber,
        sectionId,
        elementId,
        enabled
      );

      if (!updated) {
        const error = new Error('Content entry not found');
        error.statusCode = 404;
        throw error;
      }

      logger.info('Set template content enabled status', { 
        templateDefinitionId, 
        pageNumber, 
        sectionId, 
        elementId,
        enabled 
      });
      return updated;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error setting template content enabled status', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Upsert (create or update) a single template content entry
   * Uses INSERT ... ON DUPLICATE KEY UPDATE
   */
  async upsertTemplateContent(templateDefinitionId, content) {
    try {
      // Verify template exists
      const definition = await templateDefinitionRepository.findById(templateDefinitionId);
      if (!definition) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate required fields
      if (content.page_number === undefined || content.page_number === null) {
        const error = new Error('page_number is required');
        error.statusCode = 400;
        throw error;
      }
      if (!content.section_id) {
        const error = new Error('section_id is required');
        error.statusCode = 400;
        throw error;
      }
      if (!content.element_id) {
        const error = new Error('element_id is required');
        error.statusCode = 400;
        throw error;
      }
      
      // Ensure content has template_definition_id set and convert undefined to null
      // Explicitly set all fields to avoid undefined
      const contentWithId = {
        template_definition_id: templateDefinitionId,
        page_number: parseInt(content.page_number, 10),
        section_id: String(content.section_id),
        element_id: String(content.element_id),
        content_type: content.content_type ? String(content.content_type) : 'text',
        content_value: content.content_value !== undefined && content.content_value !== null 
          ? String(content.content_value) 
          : '',
        is_enabled: content.is_enabled !== undefined ? Boolean(content.is_enabled) : true,
        metadata: content.metadata !== undefined && content.metadata !== null 
          ? content.metadata 
          : null
      };
      
      // Final validation - check for undefined
      Object.keys(contentWithId).forEach(key => {
        if (contentWithId[key] === undefined) {
          const error = new Error(`Field ${key} is undefined after processing`);
          error.statusCode = 500;
          throw error;
        }
      });

      const id = await templateContentRepository.upsert(contentWithId);
      
      logger.info('Upserted template content', { 
        templateDefinitionId, 
        contentId: id,
        pageNumber: content.page_number,
        sectionId: content.section_id,
        elementId: content.element_id
      });
      return id;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error upserting template content in service', { 
        error: error.message, 
        templateDefinitionId 
      });
      throw error;
    }
  }

  /**
   * Delete template definition (soft delete)
   */
  async deleteTemplateDefinition(id) {
    try {
      const deleted = await templateDefinitionRepository.delete(id);
      if (!deleted) {
        const error = new Error('Template definition not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted template definition', { id });
      return deleted;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      logger.error('Error deleting template definition in service', { error: error.message, id });
      throw error;
    }
  }
}

export default new TemplateDefinitionService();
