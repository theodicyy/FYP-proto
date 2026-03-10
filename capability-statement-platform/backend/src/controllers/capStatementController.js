import fs from 'fs'
import path from 'path'
import capStatementService from '../services/capStatementService.js'
import capStatementRepository from '../repositories/capStatementRepository.js'
import docGenerator from '../services/docGenerator.js'
import lawyerService from '../services/lawyerService.js'
import dealService from '../services/dealService.js'
import awardService from '../services/awardService.js'

const generatedDir = path.join(process.cwd(), 'public', 'generated')
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true })


class CapStatementController {
  /**
   * =========================
   * GENERATE (DOCX FLOW)
   * =========================
   */
async generateStatement(req, res) {
  try {
    const buffer = await capStatementService.generateFullStatement(req.body || {})

    // --- Persist to disk and DB ---
    const manualFields = req.body?.manualFields || {}
    const title = manualFields.title ||
      (manualFields.client_name ? `${manualFields.client_name} Cap Statement` : null) ||
      `Capability Statement ${new Date().toISOString().slice(0, 10)}`

    const filename = `cap-statement-${Date.now()}.docx`
    const filePath = path.join(generatedDir, filename)
    fs.writeFileSync(filePath, buffer)

    const userId = req.user ? req.user.id : null
    const statementId = await capStatementRepository.create({
      title,
      status: 'generated',
      created_by_user_id: userId,
      file_path: path.join('public', 'generated', filename),
      client_name: manualFields.client_name || null,
      matter_number: manualFields.tender_number || null
    })

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Capability_Statement.docx"'
    )
    res.setHeader('X-Statement-Id', String(statementId))

    res.send(buffer)
  } catch (err) {
    console.error('❌ Generate error:', err)
    console.error('Error code:', err.code)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)

    if (err.code === 'TEMPLATE_NOT_FOUND' || err.code === 'ENOENT') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: err.code === 'TEMPLATE_NOT_FOUND' ? err.message : 'Word template file not found. Add "Cap Statement Template V1.docx" to backend/src/template/.'
        }
      })
    }

    const errorMessage = err.message || 'Failed to generate document'
    const errorCode = err.code || 'UNKNOWN_ERROR'

    res.status(500).json({
      success: false,
      error: { code: errorCode, message: errorMessage }
    })
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
    const statements = await capStatementService.getStatements()
    res.json({ success: true, data: statements })
  }

  async getStatementById(req, res) {
    const statement = await capStatementService.getStatementById(parseInt(req.params.id, 10))
    res.json({ success: true, data: statement })
  }

  /**
   * =========================
   * DOWNLOAD SAVED STATEMENT
   * =========================
   */
  async downloadStatement(req, res) {
    const statement = await capStatementRepository.findById(parseInt(req.params.id, 10))

    if (!statement) {
      return res.status(404).json({ success: false, error: { message: 'Statement not found' } })
    }

    if (!statement.file_path) {
      return res.status(404).json({ success: false, error: { message: 'No file stored for this statement' } })
    }

    const absPath = path.isAbsolute(statement.file_path)
      ? statement.file_path
      : path.join(process.cwd(), statement.file_path)

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ success: false, error: { message: 'File not found on server' } })
    }

    const safeName = statement.title
      ? `${statement.title.replace(/[^a-zA-Z0-9_\- ]/g, '_')}.docx`
      : 'Capability_Statement.docx'

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
    fs.createReadStream(absPath).pipe(res)
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
