import db from '../db/index.js'
import docGenerator from './docGenerator.js'
import { logger } from '../utils/logger.js'

class CapStatementService {

  /**
   * =====================================================
   * MAIN GENERATION ENTRY
   * =====================================================
   */
  async generateFullStatement(payload = {}) {
    try {
      logger.info('generateFullStatement payload received')

      const manualFields = payload.manualFields || {}
      const selectedIds = payload.selectedIds || {}

      const data = await this.buildTemplatePayload(manualFields, selectedIds)

      // Generate DOCX
      return docGenerator.generate(data)

    } catch (error) {
      logger.error('Error generating full statement', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * =====================================================
   * BUILD DOCXTEMPLATER PAYLOAD
   * =====================================================
   */
  async buildTemplatePayload(manualFields = {}, selectedIds = {}) {

    const lawyerIds = selectedIds.lawyerIds || []
    const dealIds = selectedIds.dealIds || []
    const awardIds = selectedIds.awardIds || []

    // ========================
    // FETCH DATABASE RECORDS
    // ========================

    const [lawyers] = lawyerIds.length
      ? await db.query(`SELECT * FROM lawyers WHERE id IN (?)`, [lawyerIds])
      : [[]]

    const [deals] = dealIds.length
      ? await db.query(`SELECT * FROM deals WHERE id IN (?)`, [dealIds])
      : [[]]

    const [awards] = awardIds.length
      ? await db.query(`SELECT * FROM awards WHERE id IN (?)`, [awardIds])
      : [[]]

    logger.info('Aggregation counts', {
      lawyers: lawyers.length,
      deals: deals.length,
      awards: awards.length
    })

    // ========================
    // LAWYERS
    // ========================

    const lawyerNames = lawyers.map(l => `${l.first_name} ${l.last_name}`)

    const lead_partners = lawyerNames.slice(0, 2).join(', ') || 'Jane Tan, Mark Lim'

    const partner1 = lawyerNames[0] || 'Jane Tan'
    const partner2 = lawyerNames[1] || 'Mark Lim'

    // ========================
    // DEALS
    // ========================

    const dealSummaries = deals.map(d => d.deal_summary).filter(Boolean)

    const previous_summary =
      dealSummaries.join('\n') || 'Previous work summary'

    const previous_transactions =
      dealSummaries.join('\n') || 'Transaction summary'

    const previous_client1 = deals[0]?.client_name || 'Test Client A'
    const previous_client2 = deals[1]?.client_name || 'Test Client B'

    // ========================
    // AWARDS
    // ========================

    const awards_list =
      awards.map(a => `${a.award_name} – ${a.awarding_organization} (${a.award_year})`).join('\n') ||
      'Test Award 2025'

    // ========================
    // FINAL PAYLOAD
    // ========================

    return {
      ...manualFields,

      lead_partners,

      partner1,
      partner2,

      lawyer1: partner1,
      lawyer2: partner2,

      previous_summary,
      previous_transactions,

      previous_client1,
      previous_client2,

      awards_list
    }
  }

  // legacy stubs so nothing crashes elsewhere
  async getStatements() { return [] }
  async getStatementById() { return null }

}

export default new CapStatementService()
