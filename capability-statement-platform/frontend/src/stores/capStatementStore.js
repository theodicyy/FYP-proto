import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '../services/dataService'

export const useCapStatementStore = defineStore('capStatement', () => {

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
    show_highlights: false,
    show_track_record: false

  })

  async function fetchStatements(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const res = await dataService.getStatements(filters)
      // backend sometimes returns { success:true, data:[...] }
      statements.value = res.data?.data ?? res.data ?? []
      return statements.value
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchStatementById(id) {
    if (!id) return null
    loading.value = true
    error.value = null
    try {
      const res = await dataService.getStatementById(id)
      currentStatement.value = res.data?.data ?? res.data ?? null
      return currentStatement.value
    } catch (e) {
      error.value = e
      throw e
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

  function getFilenameFromDisposition(disposition) {
  if (!disposition) return null

  // Handles: attachment; filename="Capability_Statement.docx"
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(disposition)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}


  function downloadBlob(blob, filename = 'capability-statement.docx') {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

async function generateStatement(payload) {
    loading.value = true
    error.value = null
    lastDownloaded.value = false

    try {
      const response = await dataService.generateStatement(payload)

      const contentType =
        response.headers?.['content-type'] ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      const filename =
        getFilenameFromDisposition(response.headers?.['content-disposition']) ||
        'Capability_Statement.docx'

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: contentType })

      generatedBlob.value = blob

      // ✅ trigger download immediately
      downloadBlob(blob, filename)
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

    // generate
    manualFields,
    generateStatement,
    generatedBlob,
    lastDownloaded,

    // shared flags
    loading,
    error
  }
})
