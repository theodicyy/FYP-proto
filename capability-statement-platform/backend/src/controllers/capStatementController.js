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

  async createVersion(req, res) {
    const { id } = req.params;
    const { content, versionName } = req.body;

    if (!content && content !== '') {
      return res.status(400).json({
        success: false,
        error: { message: 'Content is required' }
      });
    }

    const userId = req.user ? req.user.id : null;
    const version = await capStatementService.createVersion(parseInt(id, 10), content, versionName || null, userId);

    res.status(201).json({
      success: true,
      data: version
    });
  }

  async updateVersion(req, res) {
    const { id, versionId } = req.params;
    const { content, versionName } = req.body;

    // At least one of content or versionName must be provided
    if (content === undefined && versionName === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'Either content or versionName must be provided' }
      });
    }

    const version = await capStatementService.updateVersion(parseInt(versionId, 10), content, versionName);

    res.json({
      success: true,
      data: version
    });
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No image file provided' }
        });
      }

      const statementId = parseInt(req.params.id);
      
      // Verify statement exists
      const statement = await capStatementService.getStatementById(statementId);
      if (!statement) {
        return res.status(404).json({
          success: false,
          error: { message: 'Capability statement not found' }
        });
      }

      // Return the URL to access the image
      // Images are stored in public/uploads/statements/
      const imageUrl = `/uploads/statements/${req.file.filename}`;

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
      console.error('Error uploading statement image:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to upload image' }
      });
    }
  }
}

export default new CapStatementController();
