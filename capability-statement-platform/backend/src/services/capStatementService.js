import pool from '../config/database.js'
import docGenerator from './docGenerator.js'
import capStatementRepository from '../repositories/capStatementRepository.js'
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
  return pg.flatMap(item =>
    String(item)
      .replace(/\u00A0/g, ' ')        // fix weird spaces
      .replace(/\s*;\s*/g, ',')       // convert ; → ,
      .split(',')
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  )
}

  // If JSON string like '["A","B"]'
  if (typeof pg === 'string' && pg.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(pg)
      if (Array.isArray(parsed)) {
return parsed.flatMap(item =>
  String(item)
    .replace(/\u00A0/g, ' ')
    .replace(/\s*;\s*/g, ',')
    .split(',')
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
)      }
    } catch (e) {
      // fall through to split
    }
  }

  // If normal comma-separated string
  if (typeof pg === 'string') {
return pg
  .replace(/\u00A0/g, ' ')   // 🔥 fix weird spaces
  .split(/[,;]+/)            // 🔥 split comma OR semicolon
  .map(p => p.replace(/\s+/g, ' ').trim()) // normalize spaces
  .filter(Boolean)  }

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
// 🔥 FULL DB (for knowledge pool)
const [allDeals] = await pool.query(`SELECT * FROM deals`)
const [allAwards] = await pool.query(`SELECT * FROM awards`)
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
      admissions: l.qualifications || '',
        awards: l.lawyer_awards || ''   // 👈 ADD THIS

    }))

    const formatDesc = l => l.pg ? `${l.role} – ${l.pg}` : l.role

    const leads = mapped.filter(l => leadIds.includes(l.id)).slice(0, 2)
    const partners = mapped.filter(l => !leadIds.includes(l.id))

    const lawyer3 = partners[0]
    const lawyer4 = partners[1]

    // =====================================================
// ✅ SMART DEAL SELECTION (PG → fallback to transaction_types)
// =====================================================

const normalizeText = (s) =>
  String(s || '').toLowerCase().trim()

const normalizeTransactionTypes = (val) => {
  if (!val) return []
  return String(val)
    .split(';')
    .map(v => v.trim())
    .filter(Boolean)
}

// 1. Get selected PGs
const selectedPGs =
  manualFields.practice_list?.length > 0
    ? manualFields.practice_list
    : [manualFields.main_practice_area].filter(Boolean)

// 2. Match deals by PG
let matchedDeals = deals.filter(d => {
  const pgs = normalizePG(d.deal_pg).map(normalizeText)
  return selectedPGs.some(pg =>
    pgs.includes(normalizeText(pg))
  )
})

// 3. Limit to max 3
let finalDeals = matchedDeals.slice(0, 3)

// 4. Fallback using transaction_types if not enough
if (finalDeals.length < 3) {

  const existingIds = new Set(finalDeals.map(d => d.id))

  const fallbackDeals = deals.filter(d => {
    if (existingIds.has(d.id)) return false

    const types = normalizeTransactionTypes(d.transaction_types).map(normalizeText)

    return selectedPGs.some(pg =>
      types.includes(normalizeText(pg))
    )
  })

  finalDeals = [
    ...finalDeals,
    ...fallbackDeals.slice(0, 3 - finalDeals.length)
  ]
}

// 🔥 FINAL FALLBACK — guarantee minimum 3 deals
if (finalDeals.length < 3) {
  const existingIds = new Set(finalDeals.map(d => d.id))

  const remainingDeals = deals.filter(d => !existingIds.has(d.id))

  finalDeals = [
    ...finalDeals,
    ...remainingDeals.slice(0, 3 - finalDeals.length)
  ]
}

// 5. Group into ONE PG group (clean for docx)
const deal_pg_groups = selectedPGs.map(pg => ({
  pg,
  deals: finalDeals.map(d => ({
    client_name: d.client_name || '',
    deal_summary: d.deal_summary || ''
  }))
}))
const deal_rows = finalDeals.map(d => ({
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

  // Pull all deals (we filter in JS because deal_pg is JSON-ish)
  const [allDeals] = await pool.query(
    `SELECT client_name, deal_pg FROM deals ORDER BY id ASC`
  )

  const matchedDeals = allDeals.filter(d => {
    const pgs = normalizePG(d.deal_pg)
    return pgs.includes(manualFields.deal_industry)
  })

  const clientNames = matchedDeals
    .map(d => d.client_name?.trim())
    .filter(Boolean)

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
const clientMatchedDeals = deals.filter(
  d => d.client_name === manualFields.client_name
)


const findDealByPg = pg =>
  finalDeals.find(d =>
    normalizePG(d.deal_pg)
      .map(normalizeText)
      .includes(normalizeText(pg))
  )

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
// 🔥 STEP 1 — get selected practice areas (max 3)
const selectedAwardPGs = selectedPGs.slice(0, 3)
// 🔥 STEP 2 — helper to format award
const formatAward = (a) => {
  const pub = clean(a.publications)
  return {
    award_name: clean(a.award_name),
    legal_pub: pub ? `${pub},` : '',
    year: clean(a.award_year)
  }
}

// 🔥 STEP 3 — build award groups based on selected PGs
const award_groups = selectedAwardPGs.map(pg => {

  // ✅ First: try selected awards
  let pgAwards = awards.filter(a =>
normalizePG(a.award_pg)
  .map(x => x.toLowerCase())
  .includes(pg.toLowerCase())  )

  // 🔁 Fallback: use ALL awards if not enough
  if (pgAwards.length < 1) {
    pgAwards = allAwards.filter(a =>
normalizePG(a.award_pg)
  .map(x => x.toLowerCase())
  .includes(pg.toLowerCase())    )
  }

  return {
    pg,
    awards: pgAwards
      .slice(0, 2) // 🔥 limit 1–2 awards
      .map(formatAward)
  }
})

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
      admissions: l.qualifications || ''
    }))

    const lawyer_profiles = [
      ...leads.map((l, idx) => ({
        full_name: l.name,
        role: l.role,
        pg: l.pg || '',
        desc: formatDesc(l),
        email: l.email || '',
        phone: l.phone || '',
        admissions: l.qualifications || '',
            awards: formatLawyerAwards(l.awards), // 👈 ADD
        page_break: idx !== 0 // false for first lead, true otherwise
      })),
      ...partners.map(l => ({
        full_name: l.name,
        role: l.role,
        pg: l.pg || '',
        desc: formatDesc(l),
        email: l.email || '',
        phone: l.phone || '',
        admissions: l.qualifications || '',
            awards: formatLawyerAwards(l.awards), // 👈 ADD
        page_break: true
      }))
    ]

  
  // =====================================================
    // 🔥 BUILD KNOWLEDGE POOL (FULL CONTEXT TO LLM)
    // =====================================================

const knowledgePool = {
  deals,        // selected deals (keep this)
  awards,       // selected awards (keep this)

  //all_deals: allDeals,     // 🔥 NEW
  //all_awards: allAwards,   // 🔥 NEW

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

   previous_deals:
  clientMatchedDeals.length > 0
    ? clientMatchedDeals
    : finalDeals,

//all_deals: allDeals
  }
})

llmTasks.push({
  template_variable: "previous_transactions",
 prompt: `
You are a senior legal drafting assistant.

This text will appear immediately after:
"We have worked on prominent transactions involving"

Task:
Continue the phrase by describing the most relevant transactions based on the provided data.

Rules:
- Output MUST be a continuation phrase (NOT a full sentence).
-Make sure grammer is correct based on what appears before it
-Base the output directly on the provided deals; do not generalise.
-Include key facts about the deals such as Names/values etc
- Do NOT start with a capital letter.
- Do NOT use "We", "Our", or the firm name.
- Do NOT describe capabilities, sectors, or services generally.
- ONLY describe actual transactions from the data.
- Use concrete deal descriptions (e.g. acquisitions, financings, disputes).
- Keep concise (30–40 words).
- Do NOT end with a full stop.
- No bullet points, no headings, no commentary.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    scope_of_work_list: manualFields.scope_of_work_list,

    client_industry: manualFields.deal_industry,
    client_practice_group: manualFields.main_practice_area,

relevant_deals: finalDeals}
//all_deals: allDeals  }
})


llmTasks.push({
  template_variable: "most_rel_award",

prompt: `
You are a senior legal drafting assistant.



Task:
Using ONLY the selected awards provided, write a short continuation phrase referencing 1–2 of the most relevant awards.

Rules:
- Always start with The Firm is recognised as 
- Use natural flowing language (not a list).
- Mention 1–2 awards maximum.
- Keep concise (12–25 words).
- Do NOT add commentary or explanation.
- Do NOT invent or introduce new awards.
- Do NOT end with a full stop.
`,

  input_data: {
    scope_of_work: manualFields.scope_of_work,
    matter_description: manualFields.matter_desc,
    matter_type: manualFields.matter_type,
    selected_industry: manualFields.deal_industry,
    selected_practice_group: manualFields.main_practice_area,
  selected_awards: awards.filter(a =>
    manualFields.most_rel_award?.includes(a.id)
  )
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

relevant_deals: finalDeals}
//all_deals: allDeals  }
})
llmTasks.push({
  template_variable: "track_record_summary",

  prompt: `
You are a senior legal drafting assistant.

Task:
Write ONE short introductory sentence describing the types of transactions.

Rules:
- Exactly 1-2 sentences
- 20–25 words MAX
- Focus on transaction types (e.g. acquisitions, financings, investments)
- Professional, factual tone
`,

  input_data: {
    relevant_deals: finalDeals
  }
})
llmTasks.push({
  template_variable: "track_record_items",

  prompt: `
You are a senior legal drafting assistant.

Task:
Select up to 3 relevant transactions.

Rules:
- Output MUST be valid JSON ONLY
- Each summary MUST be 15–18 words MAX
- Format:
[
  { "client": "string", "summary": "string" },
  { "client": "string", "summary": "string" }
]
- Keep concise and factual
- Do NOT include extra text outside JSON
`,

  input_data: {
    relevant_deals: finalDeals
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

relevant_deals: finalDeals}
//all_deals: allDeals  }
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
      console.log("🧠 RAW LLM VARIABLES:", JSON.stringify(llmVariables, null, 2))
console.log("🧠 RAW track_record_items:", llmVariables.track_record_items)
console.log("🧠 TYPE track_record_items:", typeof llmVariables.track_record_items)
      console.log("🔥 LLM VARIABLES RETURNED:");
      console.dir(llmVariables, { depth: null });
    }
    // 🔥 STEP 4 — FLATTEN deal_rows for paraphrasing
deal_rows.forEach((row, idx) => {
  llmVariables[`deal_summary_${idx}`] = row.deal_summary
})

    // =====================================================
    // Cleaning
    // =====================================================
function extractAndFixJson(raw) {
  if (!raw) return null;

  // ✅ STEP 1 — Try direct parse (PRIMARY)
  try {
  const fixed = raw.replace(/""/g, '"') // ✅ use raw, not text
  return JSON.parse(fixed);
  } catch (err) {
    console.warn("⚠️ Direct JSON parse failed:", err.message);
  }

let text = raw.trim();

const firstBracket = text.indexOf('[');
const firstBrace = text.indexOf('{');

let start = -1;

if (firstBracket !== -1 && firstBrace !== -1) {
  start = Math.min(firstBracket, firstBrace);
} else {
  start = firstBracket !== -1 ? firstBracket : firstBrace;
}

if (start !== -1) {
  text = text.slice(start);
}

try {
  return JSON.parse(text);
} catch {
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

  // Fix encoding issues
  cleaned = cleaned.replace(/ï¿½/g, '•')

  // Split into lines first (handles broken line breaks)
  let lines = cleaned.split('\n').map(l => l.trim())

  // Keep ONLY lines that look like bullets
  lines = lines.filter(line =>
    line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
  )

  // Normalize bullets
  lines = lines.map(line => {
    // Remove any existing bullet symbols
    line = line.replace(/^[•\-\*\u25CF]\s*/, '')

    // Remove anything after weird sentence starts
    line = line.split('The following')[0]

    // Remove trailing commas
    line = line.replace(/,\s*$/, '')
    // Ensure consistent dash formatting
    line = line.replace(/\s*,\s*/g, ' – ')
    line = line.replace(/\s*-\s*/g, ' – ')

    return `• ${line.trim()}`
  })

  // Remove empty / garbage lines
  lines = lines.filter(l => l.length > 3)

  // Limit to 8
  return lines.slice(0, 8).join('\n')
}

function buildCleanAwardsList(selectedAwards, generalAwards) {
  const clean = v => (v === null || v === 'null' ? '' : v)

  // 🔥 Take ONLY 2 general awards
  const topGeneral = generalAwards.slice(0, 2)

  const combined = [
    ...selectedAwards,
    ...topGeneral
  ]

  const seen = new Set()

  const lines = combined
    .map(a => {
      const name = clean(a.award_name)
      const pub = clean(a.publications)
      const year = clean(a.award_year)

      let line = name

      if (pub) line += ` – ${pub}`
      if (year) line += ` (${year})`

      return line.trim()
    })
    .filter(Boolean)
    .filter(line => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    })

  return lines
    .slice(0, 6) // 🔥 cap total
    .map(l => `• ${l}`)
    .join('\n')
}
llmVariables.awards_list = buildCleanAwardsList(
  awards,
  top3GeneralAwards
)
function formatLawyerAwards(raw) {
  if (!raw) return ''

  let items = []

  // Case 1: already array
  if (Array.isArray(raw)) {
    items = raw
  }

  // Case 2: JSON string
  else if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) items = parsed
    } catch (e) {}
  }

  // Case 3: messy string (your case)
  else if (typeof raw === 'string') {
    // Normalize weird spacing
    let cleaned = raw
      .replace(/\s*,\s*/g, ',')   // normalize commas
      .replace(/\s{2,}/g, ' ')    // collapse spaces
      .trim()

    // Split on comma ONLY if followed by capital letter
    // (heuristic: new award usually starts uppercase)
    items = cleaned.split(/,(?=\s*[A-Z])/)
  }

  // Final clean
  items = items
    .map(a => a.trim())
    .filter(Boolean)

  // Remove duplicates
  items = [...new Set(items)]

  // Format as bullets (1 per line)
  return items
    .map(a => `• ${a}`)
    .join('\n')
}

const FIELD_TYPES = {
  previous_summary: "continuation",
  most_rel_award: "continuation",

  track_record_table: "sentence",

  deal_desc_pg1: "sentence",
  deal_desc_pg2: "sentence",
  deal_desc_pg3: "sentence",

  highlights_desc_pg1: "sentence",
  highlights_desc_pg2: "sentence",
  highlights_desc_pg3: "sentence",
  deal_summary: "sentence"
}



// 🔥 NEW SAFE TRACK RECORD MAPPING
console.log("📦 BEFORE PARSE (RAW STRING):")
console.log(llmVariables.track_record_items)
const parsedItems = extractAndFixJson(llmVariables.track_record_items);

const items = Array.isArray(parsedItems) ? parsedItems : [];console.log("📦 PARSED ITEMS:", items)
console.log("📦 ITEMS LENGTH:", items?.length)
console.log("📦 FIRST ITEM:", items?.[0])
console.log("📦 FIRST CLIENT:", items?.[0]?.client)
console.log("📦 FIRST SUMMARY:", items?.[0]?.summary)

console.log("🧩 MAPPING INPUT CHECK:")
console.log({
  item0: items[0],
  item1: items[1],
  item2: items[2]
})
Object.assign(llmVariables, {
  track_record_table: llmVariables.track_record_summary || '',

  pg_client_name1: items[0]?.client || '',
  pg_client_name2: items[1]?.client || '',
  pg_client_name3: items[2]?.client || '',

  deal_desc_pg1: items[0]?.summary || '',
  deal_desc_pg2: items[1]?.summary || '',
  deal_desc_pg3: items[2]?.summary || ''
})
// 🔥 GUARANTEE fields always exist (prevents crashes)
llmVariables.deal_desc_pg1 = llmVariables.deal_desc_pg1 || ''
llmVariables.deal_desc_pg2 = llmVariables.deal_desc_pg2 || ''
llmVariables.deal_desc_pg3 = llmVariables.deal_desc_pg3 || ''

llmVariables.pg_client_name1 = llmVariables.pg_client_name1 || ''
llmVariables.pg_client_name2 = llmVariables.pg_client_name2 || ''
llmVariables.pg_client_name3 = llmVariables.pg_client_name3 || ''

console.log("✅ AFTER MAPPING:", {
  pg1: llmVariables.pg_client_name1,
  pg2: llmVariables.pg_client_name2,
  pg3: llmVariables.pg_client_name3,
  deal1: llmVariables.deal_desc_pg1,
  deal2: llmVariables.deal_desc_pg2,
  deal3: llmVariables.deal_desc_pg3
})
function mapHighlightsToFlatFields(raw) {
  const parsed = extractAndFixJson(raw);

if (!Array.isArray(parsed)) {
  console.warn("⚠️ Invalid highlights JSON — skipping mapping");

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

const highlightFields = mapHighlightsToFlatFields(
  llmVariables.highlights_alternative
)

if (highlightFields) {
  Object.assign(llmVariables, highlightFields)
}
    // =====================================================
// 🔥 PARAPHRASE LLM CALL (NEW)
// =====================================================
  const PARAPHRASE_RULES = {

  significant_features: {
    instruction: "omit significant features of the transaction",
    fields: [
      "previous_transactions",
      "deal_desc_pg1",
      "deal_desc_pg2",
      "deal_desc_pg3",
      "highlights_desc_pg1",
      "highlights_desc_pg2",
      "highlights_desc_pg3",
      "track_record_table",       
      "deal_summary"

    ]
  },

  client_names: {
    instruction: "replace client names with generic industry descriptions",
    fields: [
      "previous_transactions",
      "track_record_table",  
      "deal_desc_pg1",
      "deal_desc_pg2",
      "deal_desc_pg3",
      "highlights_desc_pg1",
      "highlights_desc_pg2",
      "highlights_desc_pg3",
      "pg_client_name1",
      "pg_client_name2",
      "pg_client_name3",
      "highlights_name_pg1",
      "highlights_name_pg2",
      "highlights_name_pg3",
      "deal_summary"
    ]
  },

  deal_value: {
    instruction: "omit the value of the deal",
    fields: [
      "previous_transactions",
      "track_record_table",
      "deal_desc_pg1",
      "deal_desc_pg2",
      "deal_desc_pg3",
      "highlights_desc_pg1",
      "highlights_desc_pg2",
      "highlights_desc_pg3",
      "deal_summary"
    ]
  },

  deal_dates: {
    instruction: "omit the start/completion date of the deal",
    fields: [
      "previous_transactions",
      "track_record_table", 
      "deal_desc_pg1",
      "deal_desc_pg2",
      "deal_desc_pg3",
      "highlights_desc_pg1",
      "highlights_desc_pg2",
      "highlights_desc_pg3",
      "deal_summary"
    ]
  }

}
const paraphraseOptions = Array.isArray(manualFields.paraphrase_options)
  ? manualFields.paraphrase_options
  : []
const fieldInstructions = {}

paraphraseOptions.forEach(option => {
  const rule = PARAPHRASE_RULES[option]
  if (!rule) return

  rule.fields.forEach(field => {
    if (!fieldInstructions[field]) {
      fieldInstructions[field] = []
    }
    fieldInstructions[field].push(rule.instruction)
  })
})

if (paraphraseOptions.length > 0) {

  // 🔥 FORCE these fields
  [
    "pg_client_name1",
    "pg_client_name2",
    "pg_client_name3",
    "deal_desc_pg1",
    "deal_desc_pg2",
    "deal_desc_pg3"
  ].forEach(field => {
    if (!fieldInstructions[field]) {
      fieldInstructions[field] = []
    }
  })

  const paraphraseInput = {}

  Object.keys(fieldInstructions).forEach(field => {
    if (!llmVariables[field]) return

    paraphraseInput[field] = {
      text: llmVariables[field],
      instructions: fieldInstructions[field],
      type: FIELD_TYPES[field] || "sentence"
    }
  })

  // 🔥 STEP 5 — manually include flattened deal summaries
  deal_rows.forEach((row, idx) => {
    const key = `deal_summary_${idx}`

    if (!llmVariables[key]) return

    paraphraseInput[key] = {
      text: llmVariables[key],
      instructions: fieldInstructions["deal_summary"] || [],
      type: "sentence"
    }
  })

  const paraphraseTask = {
    template_variable: "paraphrased_bundle",
    prompt: `
You are a legal drafting assistant.

Task:
Paraphrase each provided field according to its instructions and type.

Rules:
- Maintain original sentence structure and format.
- Apply ONLY the provided instructions per field.
- Do NOT add new facts.
- Do NOT remove content unless instructed.
- If instruction are to replace client name, you MUST replace ALL client/entity names even if the input is only a name.
- For standalone names (e.g. "DBS Bank Ltd."), convert to a generic description (e.g. "a leading Southeast Asian bank").
- Name of the client should never appear anywhere in all fields if replace client name is chosen
- If omit deal value is given under instructions, DO NOT include any values like $2000 etc, no hard numbers at all.

Structure rules:
- If type = "continuation":
  - MUST remain a continuation clause
  - MUST start lowercase
  - MUST NOT form a full sentence
  - MUST NOT introduce a subject (e.g. "The firm", "We")

- If type = "sentence":
  - MUST remain a complete sentence
  - Keep grammar intact

Output:
- Return valid JSON ONLY
- Keep EXACT same keys
- Each value MUST remain a single string
- Do NOT add prefixes, suffixes, or explanations
- Do NOT add line breaks unless they already exist
`,
    input_data: paraphraseInput
  }

  const paraphraseResult = await llmService.generateVariables(
    {},
    [paraphraseTask]
  )

  const parsed = extractAndFixJson(
    paraphraseResult.paraphrased_bundle
  )

  if (parsed) {
    Object.keys(parsed).forEach(key => {
      if (FIELD_TYPES[key] === "continuation") {
        parsed[key] = parsed[key]
          .trim()
          .replace(/^[A-Z]/, c => c.toLowerCase())
          .replace(/\.\s*$/, '')
      }
    })

const actual = parsed.relevant_data || parsed

Object.keys(actual).forEach(key => {
  let value = actual[key]

  if (value === undefined || value === null) return

  // extract .text if object
  if (typeof value === 'object' && value.text) {
    value = value.text
  }

  if (FIELD_TYPES[key] === "continuation") {
    value = value
      .trim()
      .replace(/^[A-Z]/, c => c.toLowerCase())
      .replace(/\.\s*$/, '')
  }

  llmVariables[key] = value
})

    deal_rows.forEach((row, idx) => {
      const key = `deal_summary_${idx}`

      if (llmVariables[key]) {
        row.deal_summary = llmVariables[key]
      }
    })
  }
}

console.log("🔥 SUMMARY:", llmVariables.track_record_summary)
console.log("🔥 ITEMS:", llmVariables.track_record_items)

// =====================================================
    // FINAL PAYLOAD
    // =====================================================
    console.log("📤 FINAL PAYLOAD CHECK:", {
  pg1: llmVariables.pg_client_name1,
  deal1: llmVariables.deal_desc_pg1
})
    return {
      ...manualFields,
      ...llmVariables,
      existing_client_bool,
      main_practice_area,
  pg_client_name1: llmVariables.pg_client_name1,
  pg_client_name2: llmVariables.pg_client_name2,
  pg_client_name3: llmVariables.pg_client_name3,

  deal_desc_pg1: llmVariables.deal_desc_pg1,
  deal_desc_pg2: llmVariables.deal_desc_pg2,
  deal_desc_pg3: llmVariables.deal_desc_pg3,
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
      lead_partner1_admissions: leads[0]?.qualifications || '',

      lead_partner2_name: leads[1]?.name || '',
      lead_partner2_desc: leads[1] ? formatDesc(leads[1]) : '',
      lead_partner2_pg: leads[1]?.pg || '',
      lead_partner2_email: leads[1]?.email || '',
      lead_partner2_phone: leads[1]?.phone || '',
      lead_partner2_admissions: leads[1]?.qualifications || '',

      partner3: lawyer3?.name || '',
      lawyer_desc3: lawyer3 ? formatDesc(lawyer3) : '',
      lawyer_pg3: lawyer3?.pg || '',
      partner3_email: lawyer3?.email || '',
      partner3_phone: lawyer3?.phone || '',
      partner3_admissions: lawyer3?.qualifications || '',

      partner4: lawyer4?.name || '',
      lawyer_desc4: lawyer4 ? formatDesc(lawyer4) : '',
      lawyer_pg4: lawyer4?.pg || '',
      partner4_email: lawyer4?.email || '',
      partner4_phone: lawyer4?.phone || '',
      partner4_admissions: lawyer4?.qualifications || '',

      partner_rows,

      lawyer_profiles,

      deal_rows,
      deal_pg_groups,
      deal_table_groups,
      highlights_table_groups,



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
    }
  }

  // =====================================================
  // CRUD
  // =====================================================

  async getStatements(filters = {}) {
    const rows = await capStatementRepository.findAll(filters)
    // Attach version count and latest version_number
    const withVersions = await Promise.all(rows.map(async (s) => {
      const versions = await capStatementRepository.findVersionsByGroupId(s.group_id)
      return {
        ...s,
        version_count: versions.length,
        versions,
        latest_version: versions[0] || null,
        // Compat fields for Library.vue
        client_name: s.manual_fields?.client_name || (typeof s.manual_fields === 'string' ? JSON.parse(s.manual_fields)?.client_name : null),
        matter_number: s.manual_fields?.tender_number || (typeof s.manual_fields === 'string' ? JSON.parse(s.manual_fields)?.tender_number : null)
      }
    }))
    return withVersions
  }

  async getStatementById(id) {
    const statement = await capStatementRepository.findById(id)
    if (!statement) return null
    const versions = await capStatementRepository.findVersionsByGroupId(statement.group_id)
    const latest = versions[0] || null
    // Parse JSON fields
    const mf = typeof statement.manual_fields === 'string' ? JSON.parse(statement.manual_fields) : (statement.manual_fields || {})
    const si = typeof statement.selected_ids === 'string' ? JSON.parse(statement.selected_ids) : (statement.selected_ids || {})
    const se = typeof statement.selected_entities === 'string' ? JSON.parse(statement.selected_entities) : (statement.selected_entities || {})
    return {
      ...statement,
      manual_fields: mf,
      selected_ids: si,
      selected_entities: se,
      versions,
      latest_version: latest,
      client_name: mf.client_name || null,
      matter_number: mf.tender_number || null
    }
  }

  async updateStatement(id, data) {
    await capStatementRepository.update(id, data)
    return this.getStatementById(id)
  }

  async deleteStatement(id) {
    const statement = await capStatementRepository.findById(id)
    if (!statement) return false
    return capStatementRepository.deleteByGroupId(statement.group_id)
  }
}

export default new CapStatementService()