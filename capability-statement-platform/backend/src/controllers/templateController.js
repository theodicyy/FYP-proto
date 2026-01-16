import templateService from '../services/templateService.js';

class TemplateController {
  async getTemplates(req, res) {
    const templates = await templateService.getTemplates();
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  }

  async getTemplateById(req, res) {
    const { id } = req.params;
    const template = await templateService.getTemplateById(parseInt(id, 10));
    res.json({
      success: true,
      data: template
    });
  }

  async createTemplate(req, res) {
    const { name, description, content } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Template name and content are required' }
      });
    }

    const id = await templateService.createTemplate({ name, description, content });
    res.status(201).json({
      success: true,
      data: { id }
    });
  }

  async updateTemplate(req, res) {
    const { id } = req.params;
    const { name, description, content } = req.body;
    
    await templateService.updateTemplate(parseInt(id, 10), { name, description, content });
    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  }

  async deleteTemplate(req, res) {
    const { id } = req.params;
    await templateService.deleteTemplate(parseInt(id, 10));
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  }
}

export default new TemplateController();
