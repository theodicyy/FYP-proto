import templateDefinitionService from '../services/templateDefinitionService.js';
import { logger } from '../utils/logger.js';

class TemplateDefinitionController {
  /**
   * Get all template definitions
   * GET /api/v1/template-definitions
   */
  async getTemplateDefinitions(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const definitions = await templateDefinitionService.getTemplateDefinitions(includeInactive);
      res.json({
        success: true,
        data: definitions,
        count: definitions.length
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Get template definition by ID
   * GET /api/v1/template-definitions/:id
   */
  async getTemplateDefinitionById(req, res) {
    try {
      const { id } = req.params;
      const definition = await templateDefinitionService.getTemplateDefinitionById(parseInt(id, 10));
      res.json({
        success: true,
        data: definition
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Get template definition by name
   * GET /api/v1/template-definitions/name/:name
   */
  async getTemplateDefinitionByName(req, res) {
    try {
      const { name } = req.params;
      const definition = await templateDefinitionService.getTemplateDefinitionByName(name);
      res.json({
        success: true,
        data: definition
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Get template definition with all content entries
   * GET /api/v1/template-definitions/:id/with-content
   */
  async getTemplateDefinitionWithContent(req, res) {
    try {
      const { id } = req.params;
      const definition = await templateDefinitionService.getTemplateDefinitionWithContent(parseInt(id, 10));
      res.json({
        success: true,
        data: definition
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Get template content entries
   * GET /api/v1/template-definitions/:id/content
   */
  async getTemplateContent(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        page_number: req.query.page_number ? parseInt(req.query.page_number, 10) : undefined,
        section_id: req.query.section_id,
        is_enabled: req.query.is_enabled === 'true' ? true : req.query.is_enabled === 'false' ? false : undefined
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const content = await templateDefinitionService.getTemplateContent(parseInt(id, 10), filters);
      res.json({
        success: true,
        data: content,
        count: content.length
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Create new template definition
   * POST /api/v1/template-definitions
   */
  async createTemplateDefinition(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const id = await templateDefinitionService.createTemplateDefinition(req.body);
      res.status(201).json({
        success: true,
        data: { id }
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Update template definition
   * PUT /api/v1/template-definitions/:id
   */
  async updateTemplateDefinition(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      await templateDefinitionService.updateTemplateDefinition(parseInt(id, 10), req.body, userId);
      res.json({
        success: true,
        message: 'Template definition updated successfully'
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Update single template content entry
   * PUT /api/v1/template-definitions/:id/content/:page/:section/:element
   */
  async updateTemplateContent(req, res) {
    try {
      const { id, page, section, element } = req.params;
      const { content_value } = req.body;

      if (content_value === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'content_value is required' }
        });
      }

      await templateDefinitionService.updateTemplateContent(
        parseInt(id, 10),
        parseInt(page, 10),
        section,
        element,
        content_value
      );

      res.json({
        success: true,
        message: 'Template content updated successfully'
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Batch update template content entries
   * PUT /api/v1/template-definitions/:id/content
   */
  async updateTemplateContentBatch(req, res) {
    try {
      const { id } = req.params;
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: { message: 'updates must be an array' }
        });
      }

      await templateDefinitionService.updateTemplateContentBatch(parseInt(id, 10), updates);
      res.json({
        success: true,
        message: 'Template content updated successfully'
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Upsert (create or update) a single template content entry
   * PUT /api/v1/template-definitions/:id/content/upsert
   */
  async upsertTemplateContent(req, res) {
    try {
      const { id } = req.params;
      const { page_number, section_id, element_id, content_value, content_type, is_enabled, metadata } = req.body;

      // Validate required fields with detailed error messages
      if (page_number === undefined || page_number === null) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'page_number is required',
            details: 'Please provide a page_number in the request body'
          }
        });
      }
      
      if (!section_id) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'section_id is required',
            details: 'Please provide a section_id in the request body'
          }
        });
      }
      
      if (!element_id) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'element_id is required',
            details: 'Please provide an element_id in the request body'
          }
        });
      }
      
      if (content_value === undefined) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'content_value is required',
            details: 'Please provide content_value in the request body (can be empty string)'
          }
        });
      }

      // Build content object with explicit values (no undefined)
      // Ensure every field is explicitly set (no undefined values)
      const contentData = {
        page_number: page_number !== undefined && page_number !== null ? parseInt(page_number, 10) : null,
        section_id: section_id !== undefined && section_id !== null ? String(section_id) : null,
        element_id: element_id !== undefined && element_id !== null ? String(element_id) : null,
        content_value: content_value !== undefined && content_value !== null ? String(content_value) : '',
        content_type: content_type !== undefined && content_type !== null ? String(content_type) : 'text',
        is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : true,
        metadata: metadata !== undefined && metadata !== null ? metadata : null
      };

      // Validate no undefined values before calling service
      Object.keys(contentData).forEach(key => {
        if (contentData[key] === undefined) {
          logger.error('Undefined value detected in contentData', { key, contentData });
          throw new Error(`Field ${key} is undefined in content data`);
        }
      });

      const contentId = await templateDefinitionService.upsertTemplateContent(parseInt(id, 10), contentData);

      res.json({
        success: true,
        message: 'Template content saved successfully',
        data: { id: contentId }
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Error in upsertTemplateContent controller', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params
      });
      
      res.status(statusCode).json({
        success: false,
        error: { 
          message: error.message || 'An error occurred while saving template content',
          details: statusCode === 500 ? 'Please check the server logs for more details' : error.message
        }
      });
    }
  }

  /**
   * Enable/disable template content entry
   * PUT /api/v1/template-definitions/:id/content/:page/:section/:element/enabled
   */
  async setTemplateContentEnabled(req, res) {
    try {
      const { id, page, section, element } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: { message: 'enabled must be a boolean' }
        });
      }

      await templateDefinitionService.setTemplateContentEnabled(
        parseInt(id, 10),
        parseInt(page, 10),
        section,
        element,
        enabled
      );

      res.json({
        success: true,
        message: `Template content ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Delete template definition
   * DELETE /api/v1/template-definitions/:id
   */
  async deleteTemplateDefinition(req, res) {
    try {
      const { id } = req.params;
      await templateDefinitionService.deleteTemplateDefinition(parseInt(id, 10));
      res.json({
        success: true,
        message: 'Template definition deleted successfully'
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * Upload image for template
   * POST /api/v1/template-definitions/:id/upload-image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No image file provided' }
        });
      }

      const templateDefinitionId = parseInt(req.params.id);
      
      // Verify template exists
      const definition = await templateDefinitionService.getTemplateDefinitionById(templateDefinitionId);
      if (!definition) {
        return res.status(404).json({
          success: false,
          error: { message: 'Template definition not found' }
        });
      }

      // Return the URL to access the image
      const imageUrl = `/uploads/templates/${req.file.filename}`;
      
      res.json({
        success: true,
        data: {
          url: imageUrl,
          imageUrl: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.error('Error uploading template image', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to upload image: ' + error.message }
      });
    }
  }
}

export default new TemplateDefinitionController();
