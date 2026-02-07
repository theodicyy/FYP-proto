import capStatementRepository from '../repositories/capStatementRepository.js'
import templateRepository from '../repositories/templateRepository.js'
import templateService from './templateService.js'
import { logger } from '../utils/logger.js'

class CapStatementService {
  /**
   * =====================================================
   * GENERATE FROM MANUAL UI FIELDS (NEW CORE FLOW)
   * =====================================================
   */
  async generateFromManualFields(templateId, manualFields = {}) {
    try {
      const template = await templateRepository.findById(templateId)

      if (!template) {
        const error = new Error('Template not found')
        error.statusCode = 404
        throw error
      }

      logger.info('Generating cap statement from manual fields', {
        templateId,
        manualFieldKeys: Object.keys(manualFields)
      })

      // ✅ SINGLE SOURCE OF TRUTH FOR TEMPLATE LOGIC
      const content = templateService.populateTemplate(
        template.content,
        manualFields
      )

      return {
        content,
        template: {
          id: template.id,
          name: template.name,
          description: template.description
        }
      }
    } catch (error) {
      logger.error('Error generating from manual fields', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * =====================================================
   * SAVE STATEMENT
   * =====================================================
   */
  async saveStatement(data, userId = null) {
    try {
      const {
        title,
        description,
        content,
        templateId,
        manualFields
      } = data

      const capStatementId = await capStatementRepository.create({
        title,
        description,
        status: 'draft',
        created_by: 'system',
        created_by_user_id: userId,
        template_id: templateId || null,
        generated_content: content || null,
        edited_content: null
      })

      const existingVersions =
        await capStatementRepository.getVersionsByCapStatementId(
          capStatementId
        )

      const nextVersion =
        existingVersions.length > 0
          ? Math.max(...existingVersions.map(v => v.version_number)) + 1
          : 1

      await capStatementRepository.createVersion({
        cap_statement_id: capStatementId,
        version_number: nextVersion,
        content: content || '',
        settings: manualFields || {},
        selected_deal_ids: [],
        selected_award_ids: [],
        selected_lawyer_ids: []
      })

      logger.info('Saved cap statement', {
        capStatementId,
        version: nextVersion
      })

      return {
        id: capStatementId,
        version: nextVersion
      }
    } catch (error) {
      logger.error('Error saving statement', { error: error.message })
      throw error
    }
  }

  /**
   * =====================================================
   * UPDATE STATEMENT
   * =====================================================
   */
  async updateStatement(id, data) {
    try {
      const updateData = {}

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined)
        updateData.description = data.description
      if (data.edited_content !== undefined)
        updateData.edited_content = data.edited_content
      if (data.status !== undefined) updateData.status = data.status

      const updated = await capStatementRepository.update(id, updateData)

      if (!updated) {
        const error = new Error('Capability statement not found')
        error.statusCode = 404
        throw error
      }

      return await this.getStatementById(id)
    } catch (error) {
      logger.error('Error updating statement', {
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * =====================================================
   * DELETE STATEMENT
   * =====================================================
   */
  async deleteStatement(id) {
    try {
      await capStatementRepository.deleteVersionsByCapStatementId(id)

      const deleted = await capStatementRepository.delete(id)

      if (!deleted) {
        const error = new Error('Capability statement not found')
        error.statusCode = 404
        throw error
      }

      return true
    } catch (error) {
      logger.error('Error deleting statement', {
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * =====================================================
   * LIST STATEMENTS
   * =====================================================
   */
  async getStatements(filters = {}, userId = null, isAdmin = false) {
    try {
      if (!isAdmin && userId) {
        filters.created_by_user_id = userId
      }

      const statements = await capStatementRepository.findAll(filters)

      return Promise.all(
        statements.map(async stmt => {
          const latestVersion =
            await capStatementRepository.getLatestVersion(stmt.id)

          return {
            ...stmt,
            latest_version: latestVersion
          }
        })
      )
    } catch (error) {
      logger.error('Error fetching statements', {
        error: error.message
      })
      throw error
    }
  }

  /**
   * =====================================================
   * GET STATEMENT BY ID
   * =====================================================
   */
  async getStatementById(id) {
    try {
      const statement = await capStatementRepository.findById(id)

      if (!statement) {
        const error = new Error('Capability statement not found')
        error.statusCode = 404
        throw error
      }

      const versions =
        await capStatementRepository.getVersionsByCapStatementId(id)

      const displayContent =
        statement.edited_content ||
        statement.generated_content ||
        ''

      return {
        ...statement,
        display_content: displayContent,
        versions,
        latest_version: versions.length > 0 ? versions[0] : null
      }
    } catch (error) {
      logger.error('Error fetching statement by ID', {
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * =====================================================
   * VERSIONING (UNCHANGED)
   * =====================================================
   */
  async createVersion(capStatementId, content, versionName = null) {
    const existingVersions =
      await capStatementRepository.getVersionsByCapStatementId(
        capStatementId
      )

    const nextVersion =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map(v => v.version_number)) + 1
        : 1

    await capStatementRepository.createVersion({
      cap_statement_id: capStatementId,
      version_number: nextVersion,
      version_name: versionName,
      content: content || '',
      settings: {},
      selected_deal_ids: [],
      selected_award_ids: [],
      selected_lawyer_ids: []
    })

    return await capStatementRepository.getLatestVersion(capStatementId)
  }

  async updateVersion(versionId, content, versionName = undefined) {
    const updateData = {}

    if (content !== undefined) updateData.content = content
    if (versionName !== undefined)
      updateData.version_name = versionName

    const updated = await capStatementRepository.updateVersion(
      versionId,
      updateData
    )

    if (!updated) {
      const error = new Error('Version not found')
      error.statusCode = 404
      throw error
    }

    return await capStatementRepository.getVersionById(versionId)
  }
}

export default new CapStatementService()
