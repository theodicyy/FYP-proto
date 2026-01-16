import capStatementService from '../services/capStatementService.js';

class CapStatementController {
  async generateStatement(req, res) {
    const { templateId, dealIds, awardIds, lawyerIds, settings } = req.body;

    // User is authenticated via middleware, available in req.user
    const result = await capStatementService.generateStatement({
      templateId,
      dealIds,
      awardIds,
      lawyerIds,
      settings
    });

    res.json({
      success: true,
      data: result
    });
  }

  async saveStatement(req, res) {
    const { title, description, dealIds, awardIds, lawyerIds, settings, content, templateId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title is required' }
      });
    }

    const userId = req.user ? req.user.id : null;
    const result = await capStatementService.saveStatement({
      title,
      description,
      dealIds,
      awardIds,
      lawyerIds,
      settings,
      content,
      templateId
    }, userId);

    res.status(201).json({
      success: true,
      data: result
    });
  }

  async updateStatement(req, res) {
    const { id } = req.params;
    const { title, description, edited_content, status } = req.body;

    const result = await capStatementService.updateStatement(parseInt(id, 10), {
      title,
      description,
      edited_content,
      status
    });

    res.json({
      success: true,
      data: result
    });
  }

  async deleteStatement(req, res) {
    const { id } = req.params;
    await capStatementService.deleteStatement(parseInt(id, 10));
    res.json({
      success: true,
      message: 'Capability statement deleted successfully'
    });
  }

  async getStatements(req, res) {
    const filters = {
      status: req.query.status
    };

    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.isAdmin() : false;
    const statements = await capStatementService.getStatements(filters, userId, isAdmin);
    res.json({
      success: true,
      data: statements,
      count: statements.length
    });
  }

  async getStatementById(req, res) {
    const { id } = req.params;
    const statement = await capStatementService.getStatementById(parseInt(id, 10));
    res.json({
      success: true,
      data: statement
    });
  }
}

export default new CapStatementController();
