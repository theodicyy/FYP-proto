import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '../services/dataService'

export const useCapStatementStore = defineStore('capStatement', () => {

  const loading = ref(false)
  const error = ref(null)

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

  async function generateStatement(fields) {
    loading.value = true
    error.value = null

    try {
      const response = await dataService.generateStatement(fields)

      // 🔑 IMPORTANT: blob is response.data now
      generatedBlob.value = response.data

      // Auto download
      const url = window.URL.createObjectURL(generatedBlob.value)

      const a = document.createElement('a')
      a.href = url
      a.download = 'Capability_Statement.docx'
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      lastDownloaded.value = true

      return generatedBlob.value

    } catch (err) {
      console.error(err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    manualFields,
    loading,
    error,
    lastDownloaded,
    generatedBlob,
    generateStatement
  }
})
