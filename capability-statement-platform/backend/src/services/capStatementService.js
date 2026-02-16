import db from '../db/index.js'
import docGenerator from './docGenerator.js'
import { logger } from '../utils/logger.js'

class CapStatementService {

  /*
  =====================================================
  MAIN ENTRY
  =====================================================
  */
  async generateFullStatement(payload = {}) {
    try {
      logger.info('generateFullStatement payload received')

      const manualFields = payload.manualFields || {}
      const selectedIds = payload.selectedIds || {}

      const data = await this.buildTemplatePayload(manualFields, selectedIds)

      return docGenerator.generate(data)

    } catch (error) {
      logger.error('Error generating full statement', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /*
  =====================================================
  BUILD DOCX PAYLOAD
  =====================================================
  */
  async buildTemplatePayload(manualFields = {}, selectedIds = {}) {

    const lawyerIds = selectedIds.lawyerIds || []
    const dealIds = selectedIds.dealIds || []
    const awardIds = selectedIds.awardIds || []

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

    // ================= LAWYERS =================

    const partner1 = lawyers[0]
    const partner2 = lawyers[1]

    // ================= DEALS =================

    const d1 = deals[0]
    const d2 = deals[1]
    const d3 = deals[2]
    const d4 = deals[3]

    // ================= AWARDS =================

    const a1 = awards[0]
    const a2 = awards[1]
    const a3 = awards[2]

    return {
      ...manualFields,

      // ===== Lawyers =====

      lead_partners: [partner1, partner2].filter(Boolean).map(l => `${l.first_name} ${l.last_name}`).join(', ') || 'Jane Tan, Mark Lim',

      partner1: partner1 ? `${partner1.first_name} ${partner1.last_name}` : 'Jane Tan',
      partner2: partner2 ? `${partner2.first_name} ${partner2.last_name}` : 'Mark Lim',

      lawyer_desc1: partner1?.designation || 'Partner – Corporate',
      lawyer_desc2: partner2?.designation || 'Partner – Disputes',

      lawyer_pg1: partner1?.practice_group || 'Corporate',
      lawyer_pg2: partner2?.practice_group || 'Disputes',

      qualification1: partner1?.qualifications || 'LLB',
      admission1: partner1?.admissions || 'Singapore Bar',

      email1: partner1?.email || 'test@lawfirm.com',
      phone_number1: partner1?.phone || '12345678',

      // ===== Deals =====

      deals_pg1: d1?.deal_pg || 'M&A',
      deals_pg2: d2?.deal_pg || 'Regulatory',
      deals_pg3: d3?.deal_pg || 'Litigation',

      deals_desc1: d1?.deal_summary || 'Test Deal 1',
      deals_desc2: d2?.deal_summary || 'Test Deal 2',
      deals_desc3: d3?.deal_summary || 'Test Deal 3',
      deals_desc4: d4?.deal_summary || 'Test Deal 4',

      client_name1: d1?.client_name || 'Test Client 1',
      client_name2: d2?.client_name || 'Test Client 2',
      client_name3: d3?.client_name || 'Test Client 3',

      previous_client1: d1?.client_name || 'Client A',
      previous_client2: d2?.client_name || 'Client B',

      previous_summary: deals.map(d => d.deal_summary).filter(Boolean).join('\n') || 'Previous work summary',
      previous_transactions: deals.map(d => d.deal_summary).filter(Boolean).join('\n') || 'Transaction summary',

      // ===== Awards =====

      award_pg1: a1?.award_pg || 'Corporate',
      award_pg2: a2?.award_pg || 'Disputes',
      award_pg3: a3?.award_pg || 'Regulatory',

      award_name: a1?.award_name || 'Test Award',
      legal_pub: a1?.publications || 'Legal 500',
      year: a1?.award_year || '2025',

      awards_list:
        awards.map(a => `${a.award_name} – ${a.awarding_organization} (${a.award_year})`).join('\n')
        || 'Test Award 2025'
    }
  }

  // stubs
  async getStatements() { return [] }
  async getStatementById() { return null }

}

export default new CapStatementService()
