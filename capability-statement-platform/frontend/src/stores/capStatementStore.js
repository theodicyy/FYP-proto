import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '../services/dataService'

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

  // NEW
  cross_border_bool: false,
  practice_list: [],
  lead_partners: [],
  lawyer_roles: {},     // { lawyerId : "Head" }
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

    // 🔑 response.data IS ArrayBuffer now
    console.log('ArrayBuffer size:', response.data.byteLength)

    const blob = new Blob(
      [response.data],
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    )

    console.log('Blob size:', blob.size)

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
    return blob

  } catch (e) {
    error.value = e
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
