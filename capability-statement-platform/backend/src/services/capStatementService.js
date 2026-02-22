import pool from '../config/database.js'
import docGenerator from './docGenerator.js'
import { logger } from '../utils/logger.js'

class CapStatementService {

  // =====================================================
  // MAIN ENTRY
  // =====================================================
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

  // =====================================================
  // BUILD DOCX PAYLOAD
  // =====================================================
  async buildTemplatePayload(manualFields = {}, selectedIds = {}) {

const normalizePG = (pg) => {
  if (!pg) return []

  // If already array (JSON column)
  if (Array.isArray(pg)) {
    return pg.map(p => String(p).trim()).filter(Boolean)
  }

  // If JSON string like '["A","B"]'
  if (typeof pg === 'string' && pg.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(pg)
      if (Array.isArray(parsed)) {
        return parsed.map(p => String(p).trim()).filter(Boolean)
      }
    } catch (e) {
      // fall through to split
    }
  }

  // If normal comma-separated string
  if (typeof pg === 'string') {
    return pg.split(',').map(p => p.trim()).filter(Boolean)
  }

  return []
}


    const lawyerIds = selectedIds.lawyerIds || []
    const dealIds = selectedIds.dealIds || []
    const awardIds = selectedIds.awardIds || []

    const [lawyers] = lawyerIds.length
      ? await pool.query(`SELECT * FROM lawyers WHERE id IN (?)`, [lawyerIds])
      : [[]]

    const [deals] = dealIds.length
      ? await pool.query(`SELECT * FROM deals WHERE id IN (?)`, [dealIds])
      : [[]]

    const [awards] = awardIds.length
      ? await pool.query(`SELECT * FROM awards WHERE id IN (?)`, [awardIds])
      : [[]]
      // =====================================================
      // EXTRA GENERAL AWARDS (TOP 3, NO DUPLICATES)
      // =====================================================

      // IDs already selected
      const selectedAwardIds = awards.map(a => a.id)

      // Pull General awards
      const [generalAwardsRaw] = await pool.query(
        `SELECT * FROM awards`
      )

      // Filter only those with PG = General
      const generalAwards = generalAwardsRaw.filter(a => {
        const pgs = normalizePG(a.award_pg)
        return pgs.includes('General')
      })

      // Remove overlap with selected awards
      const filteredGeneralAwards = generalAwards.filter(
        a => !selectedAwardIds.includes(a.id)
      )

      // Take first 3 only
      const top3GeneralAwards = filteredGeneralAwards.slice(0, 3)
    // =====================================================
    // EXISTING CLIENT CHECK
    // =====================================================

    let existing_client_bool = false
    let previous_summary = ''

    if (manualFields.client_name) {
      const [clientDeals] = await pool.query(
        `SELECT deal_summary FROM deals WHERE client_name = ?`,
        [manualFields.client_name]
      )

      if (clientDeals.length) {
        existing_client_bool = true
        previous_summary = clientDeals
          .map(d => d.deal_summary)
          .filter(Boolean)
          .join('\n')
      }
    }

    // =====================================================
    // LAWYERS
    // =====================================================

    const roles = manualFields.lawyer_roles || {}
    const leadIds = manualFields.lead_partner_ids || []

    const mapped = lawyers.map(l => ({
      id: l.id,
      name: `${l.first_name} ${l.last_name}`,
      role: roles[l.id] || 'Partner',
      pg: l.practice_group || '',
      email: l.email || '',
      phone: l.phone || '',
      admissions: l.admissions || ''
    }))

    const formatDesc = l => l.pg ? `${l.role} – ${l.pg}` : l.role

    const leads = mapped.filter(l => leadIds.includes(l.id)).slice(0, 2)
    const partners = mapped.filter(l => !leadIds.includes(l.id))

    const lawyer3 = partners[0]
    const lawyer4 = partners[1]

    // =====================================================
    // DEALS GROUPED BY PRACTICE GROUP
    // =====================================================

    const deal_pg_map = {}

    deals.forEach(d => {
      normalizePG(d.deal_pg || 'General').forEach(pg => {
        if (!deal_pg_map[pg]) deal_pg_map[pg] = []

        deal_pg_map[pg].push({
          client_name: d.client_name || '',
          deal_summary: d.deal_summary || ''
        })
      })
    })

    const deal_pg_groups = Object.keys(deal_pg_map).map(pg => ({
      pg,
      deals: deal_pg_map[pg]
    }))

    const deal_rows = deals.map(d => ({
      client_name: d.client_name || '',
      deal_summary: d.deal_summary || '',
      deal_pg: d.deal_pg || ''
    }))

    // =====================================================
    // TOP 3 FROM MAIN PRACTICE AREA
    // =====================================================

    const main_practice_area = manualFields.main_practice_area || ''

    const main_pg_deals = deals
      .filter(d => normalizePG(d.deal_pg).includes(main_practice_area))
      .slice(0, 3)

    const pg_client_name1 = main_pg_deals[0]?.client_name || ''
    const pg_client_name2 = main_pg_deals[1]?.client_name || ''
    const pg_client_name3 = main_pg_deals[2]?.client_name || ''

    const deal_desc_pg1 = main_pg_deals[0]?.deal_summary || ''
    const deal_desc_pg2 = main_pg_deals[1]?.deal_summary || ''
    const deal_desc_pg3 = main_pg_deals[2]?.deal_summary || ''

    // =====================================================
    // FRONTEND SELECTED PRACTICE GROUPS
    // =====================================================

    const selectedPGs = (manualFields.practice_list || []).slice(0, 3)

    const deals_pg1 = selectedPGs[0] || ''
    const deals_pg2 = selectedPGs[1] || ''
    const deals_pg3 = selectedPGs[2] || ''

    const findDealByPg = pg =>
      deals.find(d => normalizePG(d.deal_pg).includes(pg))

    const h1 = findDealByPg(deals_pg1)
    const h2 = findDealByPg(deals_pg2)
    const h3 = findDealByPg(deals_pg3)

    const highlights_name_pg1 = h1?.client_name || ''
    const highlights_desc_pg1 = h1?.deal_summary || ''

    const highlights_name_pg2 = h2?.client_name || ''
    const highlights_desc_pg2 = h2?.deal_summary || ''

    const highlights_name_pg3 = h3?.client_name || ''
    const highlights_desc_pg3 = h3?.deal_summary || ''

    // =====================================================
    // AWARDS GROUPED BY PG
    // =====================================================
    const clean = v => (v === null || v === undefined || v === 'null') ? '' : v 
    const award_pg_map = {}

awards.forEach(a => {
  normalizePG(a.award_pg || 'General').forEach(pg => {
    if (!award_pg_map[pg]) award_pg_map[pg] = []

    award_pg_map[pg].push({
      award_name: clean(a.award_name),
      legal_pub: clean(a.publications),
      year: clean(a.award_year)
    })
  })
})

    const award_groups = Object.keys(award_pg_map).map(pg => ({
      pg,
      awards: award_pg_map[pg]
    }))

const awards_list = [
  ...awards,
  ...top3GeneralAwards
]
.map(a => `${a.award_name} – ${a.description === null || a.description === 'null' ? '' : a.description} (${a.award_year})`)
.join('\n')

    const partner_rows = partners.map(l => ({
      name: l.name,
      desc: formatDesc(l),
      pg: l.pg || '',
      email: l.email || '',
      phone: l.phone || '',
      admissions: l.admissions || ''
    }))

    const lawyer_profiles = [
      ...leads.map((l, idx) => ({
        full_name: l.name,
        role: l.role,
        pg: l.pg || '',
        desc: formatDesc(l),
        email: l.email || '',
        phone: l.phone || '',
        admissions: l.admissions || '',
        page_break: idx !== 0 // false for first lead, true otherwise
      })),
      ...partners.map(l => ({
        full_name: l.name,
        role: l.role,
        pg: l.pg || '',
        desc: formatDesc(l),
        email: l.email || '',
        phone: l.phone || '',
        admissions: l.admissions || '',
        page_break: true
      }))
    ]
  
    // =====================================================
    // FINAL PAYLOAD
    // =====================================================

    return {
      ...manualFields,

      existing_client_bool,
      previous_summary,
      main_practice_area,

      lead_partners: leads.map(l => l.name).join(', '),

      lead_partner1_name: leads[0]?.name || '',
      lead_partner1_desc: leads[0] ? formatDesc(leads[0]) : '',
      lead_partner1_pg: leads[0]?.pg || '',
      lead_partner1_email: leads[0]?.email || '',
      lead_partner1_phone: leads[0]?.phone || '',
      lead_partner1_admissions: leads[0]?.admissions || '',

      lead_partner2_name: leads[1]?.name || '',
      lead_partner2_desc: leads[1] ? formatDesc(leads[1]) : '',
      lead_partner2_pg: leads[1]?.pg || '',
      lead_partner2_email: leads[1]?.email || '',
      lead_partner2_phone: leads[1]?.phone || '',
      lead_partner2_admissions: leads[1]?.admissions || '',

      partner3: lawyer3?.name || '',
      lawyer_desc3: lawyer3 ? formatDesc(lawyer3) : '',
      lawyer_pg3: lawyer3?.pg || '',
      partner3_email: lawyer3?.email || '',
      partner3_phone: lawyer3?.phone || '',
      partner3_admissions: lawyer3?.admissions || '',

      partner4: lawyer4?.name || '',
      lawyer_desc4: lawyer4 ? formatDesc(lawyer4) : '',
      lawyer_pg4: lawyer4?.pg || '',
      partner4_email: lawyer4?.email || '',
      partner4_phone: lawyer4?.phone || '',
      partner4_admissions: lawyer4?.admissions || '',

      partner_rows,

      lawyer_profiles,

      deal_rows,
      deal_pg_groups,

      pg_client_name1,
      pg_client_name2,
      pg_client_name3,

      deal_desc_pg1,
      deal_desc_pg2,
      deal_desc_pg3,

      deals_pg1,
      deals_pg2,
      deals_pg3,

      highlights_name_pg1,
      highlights_desc_pg1,
      highlights_name_pg2,
      highlights_desc_pg2,
      highlights_name_pg3,
      highlights_desc_pg3,

      award_groups,
      awards_list
    }
  }
}

export default new CapStatementService()
