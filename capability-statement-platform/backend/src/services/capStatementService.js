import pool from '../config/database.js'
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
      ? await pool.query(`SELECT * FROM lawyers WHERE id IN (?)`, [lawyerIds])
      : [[]]

    const [deals] = dealIds.length
      ? await pool.query(`SELECT * FROM deals WHERE id IN (?)`, [dealIds])
      : [[]]

    const [awards] = awardIds.length
      ? await pool.query(`SELECT * FROM awards WHERE id IN (?)`, [awardIds])
      : [[]]

    logger.info('Aggregation counts', {
      lawyers: lawyers.length,
      deals: deals.length,
      awards: awards.length
    })

    // ========================
    // MANUAL FIELDS (from form submission)
    // ========================
    // Extract and ensure values are strings (not null/undefined)
    const client_name = String(manualFields.client_name || '').trim()
    const client_shortname = String(manualFields.client_shortname || '').trim()
    const tender_number = String(manualFields.tender_number || '').trim()
    const date = manualFields.date || ''
    
    // Debug: Log what we received
    logger.info('Manual fields received', {
      client_name: client_name || '(empty)',
      tender_number: tender_number || '(empty)',
      client_shortname: client_shortname || '(empty)',
      date: date || '(empty)',
      allManualFields: Object.keys(manualFields)
    })

    // ========================
    // FOOTER NOTES (All Pages)
    // ========================
    // Format: "proposal for - {company name} - {tender_number}"
    // Provide multiple variations to match different template placeholder names
    let footer_proposal_text = ''
    let footer_text = ''
    let proposal_footer = ''
    let footer = ''
    let proposal_text = ''
    let client_footer = ''
    
    if (client_name) {
      // Format: "proposal for - {company name}"
      const baseText = `proposal for - ${client_name}`
      footer_proposal_text = baseText
      footer_text = baseText
      proposal_footer = baseText
      footer = baseText
      proposal_text = baseText
      client_footer = baseText
      
      if (tender_number) {
        // Format: "proposal for - {company name} - {tender_number}"
        const withTender = `proposal for - ${client_name} - ${tender_number}`
        footer_proposal_text = withTender
        footer_text = withTender
        proposal_footer = withTender
        footer = withTender
        proposal_text = withTender
        client_footer = withTender
      }
    }

    // ========================
    // LAWYERS
    // ========================
    // Helper function to safely format lawyer names
    const formatLawyerName = (lawyer) => {
      if (!lawyer) return ''
      return `${lawyer.first_name || ''} ${lawyer.last_name || ''}`.trim()
    }

    // Helper function to safely get lawyer field
    const getLawyerField = (lawyer, field, defaultValue = '') => {
      return lawyer?.[field] || defaultValue
    }

    const lawyerNames = lawyers.map(formatLawyerName).filter(Boolean)

    // Lead Partners (up to 4 partners)
    const lead_partners = lawyerNames.slice(0, 2).join(', ') || 'Jane Tan, Mark Lim'
    const partner1 = lawyerNames[0] || 'Jane Tan'
    const partner2 = lawyerNames[1] || 'Mark Lim'
    const partner3 = lawyerNames[2] || ''
    const partner4 = lawyerNames[3] || ''

    // Get lawyers for detailed mapping (up to 4 lawyers)
    const lawyer1 = lawyers[0] || {}
    const lawyer2 = lawyers[1] || {}
    const lawyer3 = lawyers[2] || {}
    const lawyer4 = lawyers[3] || {}

    // ========================
    // PAGE 5 & 6 - PROJECT HEADS SECTION
    // ========================
    // First bullet point: Title
    const lawyer1_title = getLawyerField(lawyer1, 'title', '')
    const lawyer2_title = getLawyerField(lawyer2, 'title', '')

    // Second bullet point: Designation, Qualifications, Admissions
    const lawyer1_designation = getLawyerField(lawyer1, 'designation', '')
    const lawyer2_designation = getLawyerField(lawyer2, 'designation', '')

    const lawyer1_qualifications = getLawyerField(lawyer1, 'qualifications', '')
    const lawyer2_qualifications = getLawyerField(lawyer2, 'qualifications', '')

    const lawyer1_admissions = getLawyerField(lawyer1, 'admissions', '')
    const lawyer2_admissions = getLawyerField(lawyer2, 'admissions', '')

    // Single qualification/admission fields (for template placeholders like {qualification1}, {admission1})
    const qualification1 = lawyer1_qualifications || lawyer2_qualifications || ''
    const admission1 = lawyer1_admissions || lawyer2_admissions || ''

    // Format qualifications and admissions for template (combined format)
    const lawyer1_qualifications_admissions = [
      lawyer1_qualifications,
      lawyer1_admissions
    ].filter(Boolean).join(', ') || ''

    const lawyer2_qualifications_admissions = [
      lawyer2_qualifications,
      lawyer2_admissions
    ].filter(Boolean).join(', ') || ''

    // ========================
    // PAGES 21 & 22 - LAWYER DETAILS (Full Profile)
    // ========================
    // Full names
    const lawyer1_full_name = formatLawyerName(lawyer1) || 'Alicia Ng'
    const lawyer2_full_name = formatLawyerName(lawyer2) || 'Daniel Koh'
    const lawyer3_full_name = formatLawyerName(lawyer3) || ''
    const lawyer4_full_name = formatLawyerName(lawyer4) || ''

    // Simple lawyer names (alias for lawyer1, lawyer2)
    const lawyer1_name = lawyer1_full_name
    const lawyer2_name = lawyer2_full_name

    // Lawyer descriptions (lawyer_designation field, or fallback to title + practice group)
    // lawyer_designation should be a 2-3 word summary of the area of law (e.g., "Corporate Law", "M&A Specialist")
    const lawyer1_desc = getLawyerField(lawyer1, 'lawyer_designation', '') || 
      [
        getLawyerField(lawyer1, 'title', ''),
        getLawyerField(lawyer1, 'practice_group', '')
      ].filter(Boolean).join(' – ') || 'Partner – Corporate'

    const lawyer2_desc = getLawyerField(lawyer2, 'lawyer_designation', '') || 
      [
        getLawyerField(lawyer2, 'title', ''),
        getLawyerField(lawyer2, 'practice_group', '')
      ].filter(Boolean).join(' – ') || 'Partner – Disputes'

    const lawyer3_desc = getLawyerField(lawyer3, 'lawyer_designation', '') || 
      [
        getLawyerField(lawyer3, 'title', ''),
        getLawyerField(lawyer3, 'practice_group', '')
      ].filter(Boolean).join(' – ') || ''

    const lawyer4_desc = getLawyerField(lawyer4, 'lawyer_designation', '') || 
      [
        getLawyerField(lawyer4, 'title', ''),
        getLawyerField(lawyer4, 'practice_group', '')
      ].filter(Boolean).join(' – ') || ''

    // Practice groups (for lawyer_pg1, lawyer_pg2, etc.)
    const lawyer1_practice_group = getLawyerField(lawyer1, 'practice_group', '')
    const lawyer2_practice_group = getLawyerField(lawyer2, 'practice_group', '')
    const lawyer3_practice_group = getLawyerField(lawyer3, 'practice_group', '')
    const lawyer4_practice_group = getLawyerField(lawyer4, 'practice_group', '')

    // Alias for template placeholders lawyer_pg1, lawyer_pg2, etc.
    const lawyer_pg1 = lawyer1_practice_group
    const lawyer_pg2 = lawyer2_practice_group
    const lawyer_pg3 = lawyer3_practice_group
    const lawyer_pg4 = lawyer4_practice_group

    // Full lawyer details (Pages 21 & 22)
    const lawyer1_bio = getLawyerField(lawyer1, 'bio', '')
    const lawyer2_bio = getLawyerField(lawyer2, 'bio', '')
    const lawyer3_bio = getLawyerField(lawyer3, 'bio', '')
    const lawyer4_bio = getLawyerField(lawyer4, 'bio', '')

    // Pages 5 & 6 - Formatted fields for bullet points
    // Format: "{qualifications}, {admissions}" on one line, "{bio}" on another line
    // These are formatted strings ready for the template placeholders
    const lawyer1_pg5_qual_adm = [
      lawyer1_qualifications,
      lawyer1_admissions
    ].filter(Boolean).join(', ') || ''

    const lawyer2_pg5_qual_adm = [
      lawyer2_qualifications,
      lawyer2_admissions
    ].filter(Boolean).join(', ') || ''

    // Bio fields for pages 5 & 6 (formatted for template)
    const lawyer1_pg5_bio = lawyer1_bio || ''
    const lawyer2_pg5_bio = lawyer2_bio || ''

    const lawyer1_years_experience = getLawyerField(lawyer1, 'years_experience', 0)
    const lawyer2_years_experience = getLawyerField(lawyer2, 'years_experience', 0)
    const lawyer3_years_experience = getLawyerField(lawyer3, 'years_experience', 0)
    const lawyer4_years_experience = getLawyerField(lawyer4, 'years_experience', 0)

    // Lawyer deal descriptions (if needed for template)
    const lawyer_deal_desc1 = lawyer1_bio || lawyer1_desc || ''
    const lawyer_deal_desc2 = lawyer2_bio || lawyer2_desc || ''
    const lawyer_deal_desc3 = lawyer3_bio || lawyer3_desc || ''

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
    // AWARDS (Page 14)
    // ========================
    // Format awards as human-readable narrative text
    let awards_list = ''
    let awards_narrative = ''
    let award_pg1 = ''
    let award_pg2 = ''
    let award_pg3 = ''
    let most_rel_award = ''

    if (awards.length > 0) {
      // Simple list format (one award per line)
      awards_list = awards
        .map(a => {
          const parts = [
            a.award_name,
            a.awarding_organization,
            a.award_year ? `(${a.award_year})` : null
          ].filter(Boolean)
          return parts.join(' – ')
        })
        .join('\n')

      // Narrative format for Page 14 (human-readable prose)
      const awardTexts = awards.map(a => {
        let text = ''
        if (a.award_name) text += a.award_name
        if (a.awarding_organization) {
          text += text ? ` by ${a.awarding_organization}` : a.awarding_organization
        }
        if (a.award_year) {
          text += text ? ` (${a.award_year})` : `Award ${a.award_year}`
        }
        if (a.category) {
          text += text ? ` - ${a.category}` : a.category
        }
        if (a.description) {
          text += text ? `. ${a.description}` : a.description
        }
        return text
      }).filter(Boolean)

      awards_narrative = awardTexts.length > 0
        ? awardTexts.join('. ') + '.'
        : ''

      // Individual award pages (for template placeholders award_pg1, award_pg2, award_pg3)
      award_pg1 = awardTexts[0] || ''
      award_pg2 = awardTexts[1] || ''
      award_pg3 = awardTexts[2] || ''

      // Most relevant award (first award, or can be customized)
      most_rel_award = awardTexts[0] || awards_list.split('\n')[0] || ''
    } else {
      awards_list = 'Test Award 2025'
      most_rel_award = 'Test Award 2025'
    }

    // ========================
    // FINAL PAYLOAD
    // ========================
    const payload = {
      ...manualFields,

      // Manual fields (preserve all)
      client_name,
      client_shortname,
      tender_number,
      date,

      // Footer (All Pages) - Multiple variations for template compatibility
      footer_proposal_text,
      footer_text,
      proposal_footer,
      footer,
      proposal_text,
      client_footer,
      // Also provide separate fields in case template uses them individually
      footer_client_name: client_name || '',
      footer_tender_number: tender_number || '',

      // Lead Partners (up to 4)
      lead_partners,
      partner1,
      partner2,
      partner3,
      partner4,

      // Lawyers - Basic Names
      lawyer1: lawyer1_full_name,
      lawyer2: lawyer2_full_name,
      lawyer1_name,
      lawyer2_name,

      // Lawyers - Descriptions (lawyer_designation field from DB)
      lawyer_desc1: lawyer1_desc,
      lawyer_desc2: lawyer2_desc,
      lawyer_desc3: lawyer3_desc,
      lawyer_desc4: lawyer4_desc,

      // Lawyers - Page 5 & 6 (Project Heads Section)
      // First bullet: Title
      lawyer1_title,
      lawyer2_title,
      // Second bullet: Designation, Qualifications, Admissions
      lawyer1_designation,
      lawyer2_designation,
      lawyer1_qualifications,
      lawyer2_qualifications,
      lawyer1_admissions,
      lawyer2_admissions,
      lawyer1_qualifications_admissions,
      lawyer2_qualifications_admissions,
      // Single qualification/admission fields
      qualification1,
      admission1,
      // Pages 5 & 6 - Formatted bullet point fields
      // Format: "{qualifications}, {admissions}" and "{bio}"
      lawyer1_pg5_qual_adm,
      lawyer2_pg5_qual_adm,
      lawyer1_pg5_bio,
      lawyer2_pg5_bio,

      // Lawyers - Practice Groups
      lawyer1_practice_group,
      lawyer2_practice_group,
      lawyer3_practice_group,
      lawyer4_practice_group,
      lawyer_pg1,
      lawyer_pg2,
      lawyer_pg3,
      lawyer_pg4,

      // Lawyers - Pages 21 & 22 (Full Details)
      lawyer1_full_name,
      lawyer2_full_name,
      lawyer3_full_name,
      lawyer4_full_name,
      lawyer1_bio,
      lawyer2_bio,
      lawyer3_bio,
      lawyer4_bio,
      lawyer1_years_experience,
      lawyer2_years_experience,
      lawyer3_years_experience,
      lawyer4_years_experience,

      // Lawyer Deal Descriptions
      lawyer_deal_desc1,
      lawyer_deal_desc2,
      lawyer_deal_desc3,

      // Deals
      previous_summary,
      previous_transactions,
      previous_client1,
      previous_client2,

      // Awards (Page 14)
      awards_list,
      awards_narrative,
      award_pg1,
      award_pg2,
      award_pg3,
      most_rel_award
    }

    // Debug logging for footer
    logger.info('Footer mapping', {
      client_name: client_name || '(empty)',
      tender_number: tender_number || '(empty)',
      footer_proposal_text: footer_proposal_text || '(empty)',
      footer_text: footer_text || '(empty)',
      proposal_footer: proposal_footer || '(empty)',
      footer: footer || '(empty)',
      proposal_text: proposal_text || '(empty)',
      client_footer: client_footer || '(empty)',
      footer_client_name: payload.footer_client_name || '(empty)',
      footer_tender_number: payload.footer_tender_number || '(empty)'
    })
    
    // Verify client_name and tender_number are in payload
    logger.info('Payload verification', {
      has_client_name: 'client_name' in payload,
      client_name_value: payload.client_name || '(empty)',
      has_tender_number: 'tender_number' in payload,
      tender_number_value: payload.tender_number || '(empty)'
    })

    // ========================
    // PLACEHOLDER VALIDATION & DETECTION
    // ========================
    // Log summary of mapped fields for debugging
    const mappedFields = {
      lawyers: {
        count: lawyers.length,
        fields: ['title', 'designation', 'qualifications', 'admissions', 'bio', 'practice_group', 'years_experience']
      },
      awards: {
        count: awards.length,
        fields: ['award_name', 'awarding_organization', 'award_year', 'category', 'description']
      },
      deals: {
        count: deals.length,
        fields: ['client_name', 'deal_summary']
      }
    }

    logger.info('Mapped fields summary', mappedFields)

    // Detect potentially unmapped placeholders (common ones that might be missing)
    const criticalPlaceholders = [
      'client_name', 'client_shortname', 'tender_number',
      'lawyer1', 'lawyer2', 'partner1', 'partner2',
      'awards_list', 'awards_narrative'
    ]

    const missingCritical = criticalPlaceholders.filter(p => !(p in payload) || !payload[p])
    if (missingCritical.length > 0) {
      logger.warn('⚠️ Potentially missing critical placeholders:', missingCritical)
    }

    return payload
  }

  /**
   * Helper method to detect unmapped placeholders in template
   * This can be called separately to validate template compatibility
   */
  async detectUnmappedPlaceholders(templatePath) {
    // This would require reading the template file
    // For now, return a list of known placeholders we support
    return {
      supported: [
        'client_name', 'client_shortname', 'tender_number', 'date',
        'lead_partners', 'partner1', 'partner2', 'partner3', 'partner4',
        'lawyer1', 'lawyer2', 'lawyer1_full_name', 'lawyer2_full_name',
        'lawyer1_title', 'lawyer2_title', 'lawyer1_designation', 'lawyer2_designation',
        'lawyer1_qualifications', 'lawyer2_qualifications',
        'lawyer1_admissions', 'lawyer2_admissions',
        'qualification1', 'admission1',
        'lawyer1_bio', 'lawyer2_bio',
        'lawyer1_practice_group', 'lawyer2_practice_group',
        'lawyer_pg1', 'lawyer_pg2', 'lawyer_pg3', 'lawyer_pg4',
        'lawyer_desc1', 'lawyer_desc2', 'lawyer_desc3', 'lawyer_desc4',
        'awards_list', 'awards_narrative', 'award_pg1', 'award_pg2', 'award_pg3',
        'most_rel_award',
        'previous_summary', 'previous_transactions',
        'previous_client1', 'previous_client2'
      ]
    }
  }

  // legacy stubs so nothing crashes elsewhere
  async getStatements() { return [] }
  async getStatementById() { return null }

}

export default new CapStatementService()
