import capStatementService from '../services/capStatementService.js'
import docGenerator from '../services/docGenerator.js'
import lawyerService from '../services/lawyerService.js'
import dealService from '../services/dealService.js'
import awardService from '../services/awardService.js'


class CapStatementController {
  /**
   * =========================
   * GENERATE (DOCX FLOW)
   * =========================
   */
async generateStatement(req, res) {
  try {
    // 1) Read payload
    let manualFields = req.body?.manualFields || {};
    const selectedIds = req.body?.selectedIds || {};

    // Unwrap if frontend accidentally sends a ref-like object
    if (manualFields && typeof manualFields === 'object' && 'value' in manualFields) {
      manualFields = manualFields.value || {};
    }

    const lawyerIds = selectedIds.lawyerIds || [];
    const dealIds = selectedIds.dealIds || [];
    const awardIds = selectedIds.awardIds || [];

    // 2) Guard (optional but recommended)
    const nothingSelected = lawyerIds.length === 0 && dealIds.length === 0 && awardIds.length === 0;
    if (nothingSelected) {
      return res.status(400).json({
        success: false,
        error: { message: 'No records selected. Please select lawyers, deals, or awards.' }
      });
    }

    // 3) Fetch selected records in parallel
    const [lawyers, deals, awards] = await Promise.all([
      lawyerIds.length ? lawyerService.getLawyersByIds(lawyerIds) : Promise.resolve([]),
      dealIds.length ? dealService.getDealsByIds(dealIds) : Promise.resolve([]),
      awardIds.length ? awardService.getAwardsByIds(awardIds) : Promise.resolve([]),
    ]);

    // 4) Build context (BOTH halves)
    const context = {
      ...manualFields,

      // arrays (best for looping in doc template)
      lawyers,
      deals,
      awards,

      // convenience strings (useful if your template expects single placeholders)
      transaction_summary: deals
        .map(d => d.deal_name || d.title || d.name)
        .filter(Boolean)
        .join('\n'),

      awards_placeholder: awards
        .map(a => a.title || a.name)
        .filter(Boolean)
        .join('\n'),

      // You can tailor this based on your template needs
      previous_work_summary: deals
        .map(d => d.summary || d.description || d.deal_name || d.title)
        .filter(Boolean)
        .join('\n')
    };

    // 5) Generate DOCX
    const buffer = docGenerator.generate(context);

    res.status(200);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="Capability_Statement.docx"',
      'Content-Length': buffer.length
    });

    return res.end(buffer);
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).send('Failed to generate document');
  }
}




  /**
   * =========================
   * SAVE STATEMENT (LEGACY)
   * =========================
   */
  async saveStatement(req, res) {
    const { title, description, content, manualFields } = req.body

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title is required' }
      })
    }

    const userId = req.user ? req.user.id : null

    const result = await capStatementService.saveStatement(
      {
        title,
        description,
        content,
        manualFields
      },
      userId
    )

    res.status(201).json({
      success: true,
      data: result
    })
  }

  /**
   * =========================
   * UPDATE STATEMENT
   * =========================
   */
  async updateStatement(req, res) {
    const { id } = req.params
    const { title, description, edited_content, status } = req.body

    const result = await capStatementService.updateStatement(parseInt(id, 10), {
      title,
      description,
      edited_content,
      status
    })

    res.json({
      success: true,
      data: result
    })
  }

  /**
   * =========================
   * DELETE STATEMENT
   * =========================
   */
  async deleteStatement(req, res) {
    const { id } = req.params
    await capStatementService.deleteStatement(parseInt(id, 10))

    res.json({
      success: true,
      message: 'Capability statement deleted successfully'
    })
  }

  /**
   * =========================
   * LIST STATEMENTS
   * =========================
   */
  async getStatements(req, res) {
    const filters = {
      status: req.query.status
    }

    Object.keys(filters).forEach(
      key => filters[key] === undefined && delete filters[key]
    )

    const userId = req.user ? req.user.id : null
    const isAdmin = req.user ? req.user.isAdmin() : false

    const statements = await capStatementService.getStatements(
      filters,
      userId,
      isAdmin
    )

    res.json({
      success: true,
      data: statements,
      count: statements.length
    })
  }

  /**
   * =========================
   * GET STATEMENT BY ID
   * =========================
   */
  async getStatementById(req, res) {
    const { id } = req.params

    const statement = await capStatementService.getStatementById(parseInt(id, 10))

    res.json({
      success: true,
      data: statement
    })
  }

  /**
   * =========================
   * VERSIONING
   * =========================
   */
  async createVersion(req, res) {
    const { id } = req.params
    const { content, versionName } = req.body

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'Content is required' }
      })
    }

    const userId = req.user ? req.user.id : null

    const version = await capStatementService.createVersion(
      parseInt(id, 10),
      content,
      versionName || null,
      userId
    )

    res.status(201).json({
      success: true,
      data: version
    })
  }

  async updateVersion(req, res) {
    const { versionId } = req.params
    const { content, versionName } = req.body

    if (content === undefined && versionName === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'Either content or versionName must be provided' }
      })
    }

    const version = await capStatementService.updateVersion(
      parseInt(versionId, 10),
      content,
      versionName
    )

    res.json({
      success: true,
      data: version
    })
  }

  /**
   * =========================
   * IMAGE UPLOAD (UNCHANGED)
   * =========================
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No image file provided' }
        })
      }

      const statementId = parseInt(req.params.id, 10)

      const statement = await capStatementService.getStatementById(statementId)
      if (!statement) {
        return res.status(404).json({
          success: false,
          error: { message: 'Capability statement not found' }
        })
      }

      const imageUrl = `/uploads/statements/${req.file.filename}`

      res.json({
        success: true,
        data: {
          url: imageUrl,
          imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      })
    } catch (error) {
      console.error('Error uploading statement image:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to upload image' }
      })
    }
  }
}

export default new CapStatementController()
