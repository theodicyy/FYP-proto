import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '../services/dataService'
import { useDataStore } from './dataStore'

export const useCapStatementStore = defineStore('capStatement', () => {

  /* ======================
     STATE
  ====================== */

  const loading = ref(false)
  const error = ref(null)

  const statements = ref([])
  const currentStatement = ref(null)
  const isEditing = ref(false)

  const lastDownloaded = ref(false)
  const generatedBlob = ref(null)

  // Holds the group_id when editing an existing statement for re-generation
  const editGroupId = ref(null)

 const manualFields = ref({
  client_name: '',
  client_shortname: '',
  date: '',
  tender_number: '',
  doc_type: '',
  matter_type: '',
  client_type: '',
  matter_desc: '',
  scope_of_work: '',
  scope_of_work_list: '',
  discount_rate: '',
  main_practice_area: '',
  fee_assumptions: '',

  deal_industry: '',
  industry_specific_pitch: false,

  cross_border_bool: false,
  practice_list: [],
  lead_partner_ids: [],
  lawyer_roles: {},
  most_rel_award: [],

  show_highlights: false,
  show_track_record: false
})


  /* ======================
     FETCH LIBRARY
  ====================== */

  async function fetchStatements(filters = {}) {
    loading.value = true
    try {
      const res = await dataService.getStatements(filters)
      statements.value = res?.data ?? res ?? []
      return statements.value
    } finally {
      loading.value = false
    }
  }

  async function fetchStatementById(id) {
    if (!id) return null
    loading.value = true
    try {
      const res = await dataService.getStatementById(id)
      currentStatement.value = res?.data ?? res ?? null
      return currentStatement.value
    } finally {
      loading.value = false
    }
  }

  function startEditing() {
    isEditing.value = true
  }

  function cancelEditing() {
    isEditing.value = false
  }

  /* ======================
     LOAD FOR EDIT
     Fetches saved form inputs + selected entities
     for a statement, then restores all stores so
     /configuration is pre-filled as a new version.
  ====================== */

  async function loadForEdit(statementId) {
    loading.value = true
    error.value = null
    try {
      const res = await dataService.getEditData(statementId)
      const { group_id, manual_fields, selected_entities } = res.data

      // Normalise stored fields — JSON keys are always strings but Vue
      // checkbox v-model uses strict equality with numeric IDs.
      const mf = manual_fields || {}

      // lawyer_roles: ensure keys are Numbers to match l.id at runtime
      const normalisedRoles = {}
      if (mf.lawyer_roles && typeof mf.lawyer_roles === 'object') {
        Object.entries(mf.lawyer_roles).forEach(([k, v]) => {
          normalisedRoles[Number(k)] = v
        })
      }

      // lead_partner_ids and most_rel_award: ensure array of Numbers
      const normalisedLeadIds = (mf.lead_partner_ids || []).map(Number)
      const normalisedAwardIds = (mf.most_rel_award || []).map(Number)

      // Restore manual fields — reset first, then apply saved values
      Object.assign(manualFields.value, {
        client_name: '',
        client_shortname: '',
        date: '',
        tender_number: '',
        doc_type: '',
        matter_type: '',
        client_type: '',
        matter_desc: '',
        scope_of_work: '',
        scope_of_work_list: '',
        discount_rate: '',
        main_practice_area: '',
        fee_assumptions: '',
        deal_industry: '',
        industry_specific_pitch: false,
        cross_border_bool: false,
        practice_list: [],
        lead_partner_ids: [],
        lawyer_roles: {},
        most_rel_award: [],
        show_highlights: false,
        show_track_record: false,
        ...mf,
        // Overwrite with normalised versions
        lawyer_roles: normalisedRoles,
        lead_partner_ids: normalisedLeadIds,
        most_rel_award: normalisedAwardIds
      })

      // Store group_id so the next generate creates a new version
      editGroupId.value = group_id

      // Restore selected lawyers/deals/awards into dataStore
      // Uses full entity objects saved in DB — no extra API calls needed
      const dataStore = useDataStore()
      dataStore.clearSelections()

      const entities = selected_entities || {}
      const lawyers = entities.lawyers || []
      const deals = entities.deals || []
      const awards = entities.awards || []

      lawyers.forEach(l => dataStore.toggleLawyerSelection(l))
      deals.forEach(d => dataStore.toggleDealSelection(d))
      awards.forEach(a => dataStore.toggleAwardSelection(a))

    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /* ======================
     DOWNLOAD HELPER
  ====================== */

  function downloadBlob(blob, filename = 'Capability_Statement.docx') {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  /* ======================
     GENERATE DOCX
  ====================== */

  async function generateStatement(payload) {
  loading.value = true
  error.value = null
  lastDownloaded.value = false

  try {
    const response = await dataService.generateStatement(payload)

    const blob = new Blob(
      [response.data],
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    )

    generatedBlob.value = blob

    // Auto download
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Capability_Statement.docx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    lastDownloaded.value = true

    // Clear edit group after successful generation
    editGroupId.value = null

    return blob

  } catch (e) {
    error.value = e
    if ((e.response?.status === 503 || e.response?.status === 500) && e.response?.data) {
      try {
        const raw = e.response.data instanceof ArrayBuffer
          ? new TextDecoder().decode(e.response.data)
          : e.response.data
        const body = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (body?.error?.message) {
          e.friendlyMessage = body.error.message
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError)
      }
    }
    if (!e.friendlyMessage && e.response?.status === 500) {
      e.friendlyMessage = 'Server error while generating the document. Check server logs for details.'
    }
    throw e
  } finally {
    loading.value = false
  }
}


  return {
    // library
    statements,
    currentStatement,
    isEditing,
    fetchStatements,
    fetchStatementById,
    startEditing,
    cancelEditing,

    // edit flow
    editGroupId,
    loadForEdit,

    // generation
    manualFields,
    generateStatement,
    generatedBlob,
    lastDownloaded,

    // flags
    loading,
    error
  }
})
