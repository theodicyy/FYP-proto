import pool from '../config/database.js'
import docGenerator from './docGenerator.js'
import { logger } from '../utils/logger.js'
import llmService from './llmService.js'

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
    let list_client_deals = ''

    if (manualFields.client_name) {
      const [clientDeals] = await pool.query(
        `SELECT deal_summary FROM deals WHERE client_name = ?`,
        [manualFields.client_name]
      )

      if (clientDeals.length) {
        existing_client_bool = true
        list_client_deals = clientDeals
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
    // MAIN PRACTICE AREA (from deal_industry dropdown or manual)
    // =====================================================
    const main_practice_area = manualFields.deal_industry || manualFields.main_practice_area || ''

    // =====================================================
    // PREVIOUS CLIENTS (up to 8) from deals by selected deal_industry
    // =====================================================
    let previous_client1 = ''
    let previous_client2 = ''
    let previous_client3 = ''
    let previous_client4 = ''
    let previous_client5 = ''
    let previous_client6 = ''
    let previous_client7 = ''
    let previous_client8 = ''
    if (manualFields.deal_industry) {
      const [industryDeals] = await pool.query(
        `SELECT client_name FROM deals WHERE deal_industry = ? ORDER BY id ASC LIMIT 8`,
        [manualFields.deal_industry]
      )
      const clientNames = industryDeals.map((d) => (d.client_name != null ? String(d.client_name).trim() : '')).filter(Boolean)
      previous_client1 = clientNames[0] || ''
      previous_client2 = clientNames[1] || ''
      previous_client3 = clientNames[2] || ''
      previous_client4 = clientNames[3] || ''
      previous_client5 = clientNames[4] || ''
      previous_client6 = clientNames[5] || ''
      previous_client7 = clientNames[6] || ''
      previous_client8 = clientNames[7] || ''
    }

    // =====================================================
    // DEAL TABLE GROUPS (reactive: 1 table per 3 deals)
    // Uses the deals the user explicitly selected via dealIds.
    // 1–3 deals → 1 table, 4–6 deals → 2 tables, etc.
    // =====================================================
    const deal_table_groups = []
    for (let i = 0; i < deals.length; i += 3) {
      const chunk = deals.slice(i, i + 3)
      deal_table_groups.push({
        col1_name: chunk[0]?.client_name  || '',
        col1_desc: chunk[0]?.deal_summary || '',
        col2_name: chunk[1]?.client_name  || '',
        col2_desc: chunk[1]?.deal_summary || '',
        col3_name: chunk[2]?.client_name  || '',
        col3_desc: chunk[2]?.deal_summary || '',
      })
    }

    // =====================================================
    // FRONTEND SELECTED PRACTICE GROUPS → HIGHLIGHTS TABLE GROUPS
    // =====================================================
    // Uses selected deals directly. The practice area label shown in the
    // grey row comes from deal_pg (or deal_industry as fallback).
    // If practice_list is provided by the frontend, use that for labels
    // and match deals; otherwise derive labels from the deals themselves.
    // Groups of 3 → one pair of tables. 1–3 = 1 group, 4–6 = 2 groups.
    // =====================================================

    const selectedPGs = manualFields.practice_list || []

    const findDealByPg = pg =>
      deals.find(d => normalizePG(d.deal_pg).includes(pg))

    // Build highlight items: prefer practice_list mapping, fall back to deals directly
    let highlightItems
    if (selectedPGs.length > 0) {
      highlightItems = selectedPGs.map(pg => {
        const deal = findDealByPg(pg)
        return {
          pg:   pg || '',
          name: deal?.client_name  || '',
          desc: deal?.deal_summary || '',
        }
      })
    } else {
      // No practice_list — derive from selected deals using their deal_pg as label
      highlightItems = deals.map(d => ({
        pg:   normalizePG(d.deal_pg)[0] || d.deal_industry || '',
        name: d.client_name  || '',
        desc: d.deal_summary || '',
      }))
    }

    // Chunk into groups of 3
    const highlights_table_groups = []
    for (let i = 0; i < highlightItems.length; i += 3) {
      const chunk = highlightItems.slice(i, i + 3)
      highlights_table_groups.push({
        col1_pg:   chunk[0]?.pg   || '',
        col1_name: chunk[0]?.name || '',
        col1_desc: chunk[0]?.desc || '',
        col2_pg:   chunk[1]?.pg   || '',
        col2_name: chunk[1]?.name || '',
        col2_desc: chunk[1]?.desc || '',
        col3_pg:   chunk[2]?.pg   || '',
        col3_name: chunk[2]?.name || '',
        col3_desc: chunk[2]?.desc || '',
      })
    }

    // Legacy scalar vars kept for backward-compat
    const deals_pg1 = selectedPGs[0] || ''
    const deals_pg2 = selectedPGs[1] || ''
    const deals_pg3 = selectedPGs[2] || ''
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
    // 🔥 BUILD KNOWLEDGE POOL (FULL CONTEXT TO LLM)
    // =====================================================

    const knowledgePool = {
      lawyers,
      deals,
      awards,
      manual_fields: manualFields
    }

    // =====================================================
    // 🔥 DEFINE LLM TASKS HERE
    // =====================================================

    const llmTasks = []
llmTasks.push({
  template_variable: "previous_summary",

  prompt: `
You are a senior legal drafting assistant.

This output will be inserted mid-sentence immediately after:
"Having previously advised {CLIENT_SHORT_NAME} on "

Task:
Looking at the previous industry of the client from relevant data json, select the most relevant prior work and transactions from knowledge pool data. Summarise them as a continuation clause.

Rules:
- Output must be a continuation clause (not a standalone paragraph).
- Do NOT start a new sentence.
- Do NOT begin with the client name, "We", or "Our firm".
- Keep factual; avoid marketing/superlatives.
- No bullet points, no headings, no quotes, no commentary.
- Do NOT end with a full stop.
- Aim for 25–45 words.
`,

  input_data: {
    client_short_name: manualFields.client_shortname,
    client_name: manualFields.client_name,
    existing_client_bool,
    previous_deals: deals.filter(
      d => d.client_name === manualFields.client_name
    )
  }
})

llmTasks.push({
  template_variable: "previous_transactions",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the scope of services, client industry, and client practice group from the relevant data json. 
From the knowledge pool, select only the deals from the client industry and client practice group. From this smaller pool, select the most relevant transactions based on the scope of services, and summarise their most important details.

Rules:
- Output exactly 1–2 sentences.
- Standalone text (can be pasted as its own paragraph).
- Factual, measured tone; no superlatives or marketing.
- Do NOT invent missing details; omit unknowns silently.
- No bullet points, no headings, no quotes, no commentary.
- Keep to 45–70 words total.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    scope_of_work_list: manualFields.scope_of_work_list,

    client_industry: manualFields.deal_industry,
    client_practice_group: manualFields.main_practice_area,

    relevant_deals: deals.filter(d =>
      d.deal_industry === manualFields.deal_industry &&
      normalizePG(d.deal_pg).includes(manualFields.main_practice_area)
    )
  }
})

llmTasks.push({
  template_variable: "awards_list",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the practice group from the relevant data json. 
From the knowledge pool, select 7–8 awards most relevant to the practice group provided and present them as bullet points suitable for a client-facing credentials/proposal document.

Rules:
- Output 7–8 bullet points.
- Use the bullet symbol "• " at the start of each line.
- Each bullet should contain: award/ranking + awarding body/publication + (year if available).
- Keep wording consistent across bullets; avoid hype.
- Use only the knowledge pool; do not invent facts.
- No headings, no extra commentary.
`,

  input_data: {
    selected_practice_group: manualFields.main_practice_area,

    relevant_awards: awards.filter(a =>
      normalizePG(a.award_pg).includes(manualFields.main_practice_area)
    )
  }
})
llmTasks.push({
  template_variable: "most_rel_award",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the scope of services from the relevant data json. 
From the knowledge pool, pick the 2 most relevant awards based on the scope of services and write a concise client-facing sentence referencing them.

Rules:
- Output exactly 1 sentence.
- Must mention both awards and the awarding bodies/publications.
- Factual, measured tone; no superlatives or marketing.
- Use only the knowledge pool; do not invent facts.
- No bullet points, no quotes, no commentary.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    matter_description: manualFields.matter_desc,
    matter_type: manualFields.matter_type,
    selected_industry: manualFields.deal_industry,
    selected_practice_group: manualFields.main_practice_area,
    selected_award_ids: manualFields.most_rel_award,
    awards
  }
})      
llmTasks.push({
  template_variable: "track_record_bullet_list",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the scope of services, client industry, and client practice group from the relevant data json. 
From the knowledge pool, select only the deals from the client industry and client practice group. From this smaller pool, select the most relevant transactions based on the scope of services, and group them by practice group (PG). For each transaction, produce a one-line bullet combining: client name + deal name + short description.

Rules:
- Output MUST be valid JSON only (no extra text).
- JSON format:
  [
    {
      ""practice_group"": ""Corporate"",
      ""items"": [
        {""line"": ""Client – Deal – short factual description (no hype)""},
        {""line"": ""...""}
      ]
    },
    ...
  ]
- Keep each line <= 22 words.
- Use only the knowledge pool; do not invent facts.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    scope_of_work_list: manualFields.scope_of_work_list,
    client_industry: manualFields.deal_industry,
    client_practice_group: manualFields.main_practice_area,

    relevant_deals: deals.filter(d =>
      d.deal_industry === manualFields.deal_industry &&
      normalizePG(d.deal_pg).includes(manualFields.main_practice_area)
    )
  }
})
llmTasks.push({
  template_variable: "track_record_table",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the scope of services, client industry, and client practice group from the relevant data json. 
From the knowledge pool, select only the deals from the client industry and client practice group. From this smaller pool, select the most relevant transactions based on the scope of services, and group them by client name. For each client, provide a concise one-sentence summary of the relevant work.

Rules:
- Output MUST be valid JSON only (no extra text).
- JSON format:
  [
    {""client"":""..."", ""summary"":""One factual sentence summarising relevant work (no hype).""},
    {""client"":""..."", ""summary"":""...""}
  ]
- Each summary must be 18–30 words.
- Use only the knowledge pool; do not invent facts.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    scope_of_work_list: manualFields.scope_of_work_list,
    client_industry: manualFields.deal_industry,
    client_practice_group: manualFields.main_practice_area,

    relevant_deals: deals.filter(d =>
      d.deal_industry === manualFields.deal_industry &&
      normalizePG(d.deal_pg).includes(manualFields.main_practice_area)
    )
  }
})

llmTasks.push({
  template_variable: "highlights_alternative",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select the scope of services, client industry, and client practice group from the relevant data json. 
From the knowledge pool, select only the deals from the client industry and client practice group. From this smaller pool, select the most relevant transactions based on the scope of services, and group them by practice group, with client name and summary of each deal. Include notable points etc and place more important on significant factors as stated in the data. 

Rules:
- Output MUST be valid JSON only (no extra text).
- JSON format:
  [
    {
      ""practice_group"":""..."",
      ""highlights"":[
        {""client"":""..."", ""summary"":""One factual sentence (no hype).""},
        {""client"":""..."", ""summary"":""...""}
      ]
    }
  ]
- Each summary 18–30 words.
- Use only the knowledge pool; do not invent facts.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    scope_of_work_list: manualFields.scope_of_work_list,
    client_industry: manualFields.deal_industry,
    client_practice_group: manualFields.main_practice_area,

    relevant_deals: deals.filter(d =>
      d.deal_industry === manualFields.deal_industry &&
      normalizePG(d.deal_pg).includes(manualFields.main_practice_area)
    )
  }
})



    // =====================================================
    // 🔥 CALL LLM ENGINE (PYTHON)
    // =====================================================

    let llmVariables = {}

    if (llmTasks.length > 0) {
      llmVariables = await llmService.generateVariables(
        knowledgePool,
        llmTasks
      )
      console.log("🔥 LLM VARIABLES RETURNED:");
      console.dir(llmVariables, { depth: null });
    }
    // =====================================================
    // Cleaning
    // =====================================================
function extractAndFixJson(raw) {
  if (!raw) return null;

  let text = raw.trim();

  // Remove "Paragraph:" prefix (can appear multiple times)
  text = text.replace(/Paragraph:\s*/gi, '');

  // Keep only from first [ or {
  const firstBracket = text.indexOf('[');
  const firstBrace = text.indexOf('{');

  let start = -1;

  if (firstBracket !== -1 && firstBrace !== -1) {
    start = Math.min(firstBracket, firstBrace);
  } else {
    start = firstBracket !== -1 ? firstBracket : firstBrace;
  }

  if (start === -1) return null;

  text = text.slice(start);

  // Fix double-double quotes
  text = text.replace(/""/g, '"');

  // Remove stray ? inside JSON
  text = text.replace(/"\?\s*,/g, '",');

  // Remove trailing incomplete fragments
  const lastBracket = text.lastIndexOf(']');
  if (lastBracket !== -1) {
    text = text.slice(0, lastBracket + 1);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("JSON parse failed after cleaning:", err);
    console.log("Cleaned JSON attempt:\n", text);
    return null;
  }
}

function cleanPreviousSummary(text) {
  if (!text) return ''

  let cleaned = text.trim()

  // Remove repeated opening phrase if model included it
  cleaned = cleaned.replace(
    /^Having previously advised.*? on\s+/i,
    ''
  )

  // Remove leading capital letter (force continuation clause)
  cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1)

  // Remove trailing full stop
  cleaned = cleaned.replace(/\.\s*$/, '')

  return cleaned
}

llmVariables.previous_summary = cleanPreviousSummary(
  llmVariables.previous_summary
)

function cleanAwardsList(text) {
  if (!text) return ''

  let cleaned = text.trim()

  // Fix broken bullet encoding
  cleaned = cleaned.replace(/ï¿½/g, '•')

  // Split by bullet symbol
  let items = cleaned
    .split('•')
    .map(i => i.trim())
    .filter(Boolean)

  // Limit to 8 maximum
  items = items.slice(0, 8)

  // Normalize format
  items = items.map(item => {

    // Extract year
    const yearMatch = item.match(/\b(20\d{2})\b/)
    const year = yearMatch ? yearMatch[1] : ''

    // Extract awarding body inside parentheses
    const pubMatch = item.match(/\(([^)]+)\)/)
    const publication = pubMatch ? pubMatch[1] : ''

    // Remove all parentheses content from main title
    let title = item.replace(/\([^)]*\)/g, '').trim()

    // Remove duplicate year words
    title = title.replace(/\b20\d{2}\b/g, '').trim()

    return `• ${title}${publication ? ' – ' + publication : ''}${year ? ' (' + year + ')' : ''}`
  })

  return items.join('\n')
}
llmVariables.awards_list =
  cleanAwardsList(llmVariables.awards_list)

  function mapLLMTrackRecordToDealGroups(raw) {
  const parsed = extractAndFixJson(raw);
  if (!parsed) return [];

  return parsed.map(group => ({
    pg: group.practice_group || '',
    deals: (group.items || []).map(item => ({
      deal_summary: item.line || ''
    }))
  }));
}

llmVariables.deal_pg_groups =
  mapLLMTrackRecordToDealGroups(
    llmVariables.track_record_bullet_list
  );


  function mapTrackRecordTableToFlatFields(raw) {
  const parsed = extractAndFixJson(raw);
  if (!parsed) {
    return {
      pg_client_name1: '',
      pg_client_name2: '',
      pg_client_name3: '',
      deal_desc_pg1: '',
      deal_desc_pg2: '',
      deal_desc_pg3: ''
    };
  }

  return {
    pg_client_name1: parsed[0]?.client || '',
    pg_client_name2: parsed[1]?.client || '',
    pg_client_name3: parsed[2]?.client || '',

    deal_desc_pg1: parsed[0]?.summary || '',
    deal_desc_pg2: parsed[1]?.summary || '',
    deal_desc_pg3: parsed[2]?.summary || ''
  };
}

Object.assign(
  llmVariables,
  mapTrackRecordTableToFlatFields(
    llmVariables.track_record_table
  )
);


function mapHighlightsToFlatFields(raw) {
  const parsed = extractAndFixJson(raw);
  if (!parsed) {
    return {
      deals_pg1: '',
      deals_pg2: '',
      deals_pg3: '',
      highlights_name_pg1: '',
      highlights_desc_pg1: '',
      highlights_name_pg2: '',
      highlights_desc_pg2: '',
      highlights_name_pg3: '',
      highlights_desc_pg3: ''
    };
  }

  const flat = {
    deals_pg1: parsed[0]?.practice_group || '',
    deals_pg2: parsed[1]?.practice_group || '',
    deals_pg3: parsed[2]?.practice_group || ''
  };

  // Flatten all highlights into single list
  const allHighlights = parsed.flatMap(g => g.highlights || []);

  flat.highlights_name_pg1 = allHighlights[0]?.client || '';
  flat.highlights_desc_pg1 = allHighlights[0]?.summary || '';

  flat.highlights_name_pg2 = allHighlights[1]?.client || '';
  flat.highlights_desc_pg2 = allHighlights[1]?.summary || '';

  flat.highlights_name_pg3 = allHighlights[2]?.client || '';
  flat.highlights_desc_pg3 = allHighlights[2]?.summary || '';

  return flat;
}

Object.assign(
  llmVariables,
  mapHighlightsToFlatFields(
    llmVariables.highlights_alternative
  )
);
    // =====================================================
    // FINAL PAYLOAD
    // =====================================================

    return {
      ...manualFields,
      ...llmVariables,
      existing_client_bool,
      main_practice_area,

      previous_client1,
      previous_client2,
      previous_client3,
      previous_client4,
      previous_client5,
      previous_client6,
      previous_client7,
      previous_client8,

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

 




      award_groups,
    }
  }
}

export default new CapStatementService()