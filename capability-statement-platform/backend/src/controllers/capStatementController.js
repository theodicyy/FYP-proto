import crypto from 'crypto'
import capStatementService from '../services/capStatementService.js'
import capStatementRepository from '../repositories/capStatementRepository.js'

class CapStatementController {
  /**
   * =========================
   * GENERATE (DOCX FLOW)
   * Saves DOCX as BLOB in DB + all form inputs
   * =========================
   */
  async generateStatement(req, res) {
    try {
      const buffer = await capStatementService.generateFullStatement(req.body || {})

      const manualFields = req.body?.manualFields || {}
      const selectedIds = req.body?.selectedIds || {}
      const selectedEntities = req.body?.selectedEntities || {}
      const title = manualFields.title ||
        (manualFields.client_name ? `${manualFields.client_name} Cap Statement` : null) ||
        `Capability Statement ${new Date().toISOString().slice(0, 10)}`

      const userId = req.user ? req.user.id : null

      // Determine group_id and version_number
      // If editing a previous statement, group_id comes from the request
      const groupId = req.body?.group_id || crypto.randomUUID()
      let versionNumber = 1

      if (req.body?.group_id) {
        const latestVer = await capStatementRepository.getLatestVersionNumber(groupId)
        versionNumber = latestVer + 1
      }

      const statementId = await capStatementRepository.create({
        group_id: groupId,
        version_number: versionNumber,
        title,
        status: 'generated',
        created_by_user_id: userId,
        manual_fields: manualFields,
        selected_ids: selectedIds,
        selected_entities: selectedEntities,
        docx_blob: buffer
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
      res.setHeader('X-Group-Id', groupId)

      res.send(buffer)
    } catch (err) {
      console.error('Generate error:', err)

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
   * UPDATE STATEMENT (status only)
   * =========================
   */
  async updateStatement(req, res) {
    const { id } = req.params
    const { title, status } = req.body

    const result = await capStatementService.updateStatement(parseInt(id, 10), {
      title,
      status
    })

    res.json({
      success: true,
      data: result
    })
  }

  /**
   * =========================
   * DELETE STATEMENT (all versions)
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
    if (!statement) {
      return res.status(404).json({ success: false, error: { message: 'Statement not found' } })
    }
    res.json({ success: true, data: statement })
  }

  /**
   * =========================
   * DOWNLOAD DOCX FROM DB (BLOB)
   * =========================
   */
  async downloadStatement(req, res) {
    const id = parseInt(req.params.id, 10)
    const statement = await capStatementRepository.findById(id)

    if (!statement) {
      return res.status(404).json({ success: false, error: { message: 'Statement not found' } })
    }

    const blob = await capStatementRepository.getDocxBlob(id)

    if (!blob) {
      return res.status(404).json({ success: false, error: { message: 'No DOCX file stored for this statement' } })
    }

    const safeName = statement.title
      ? `${statement.title.replace(/[^a-zA-Z0-9_\- ]/g, '_')}.docx`
      : 'Capability_Statement.docx'

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
    res.send(Buffer.from(blob))
  }

  /**
   * =========================
   * GET FORM DATA FOR EDIT
   * Returns manual_fields + selected_ids so frontend
   * can pre-fill /configuration for a new version
   * =========================
   */
  async getEditData(req, res) {
    const id = parseInt(req.params.id, 10)
    const statement = await capStatementService.getStatementById(id)

    if (!statement) {
      return res.status(404).json({ success: false, error: { message: 'Statement not found' } })
    }

    res.json({
      success: true,
      data: {
        group_id: statement.group_id,
        manual_fields: statement.manual_fields,
        selected_ids: statement.selected_ids,
        selected_entities: statement.selected_entities
      }
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
