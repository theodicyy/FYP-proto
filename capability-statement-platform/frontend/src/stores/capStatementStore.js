import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '../services/dataService'

export const useCapStatementStore = defineStore('capStatement', () => {
  // State
  const statements = ref([])
  const currentStatement = ref(null)
  const generatedContent = ref('')
  const editedContent = ref('')
  const isEditing = ref(false)
  const selectedTemplateId = ref(null)
  const templates = ref([])
  const settings = ref({
    includeDeals: true,
    includeAwards: true,
    includeLawyers: true,
    format: 'standard'
  })
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchTemplates() {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getTemplates()
      templates.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching templates:', err)
    } finally {
      loading.value = false
    }
  }

  async function generateStatement(dealIds, awardIds, lawyerIds, templateId = null) {
    loading.value = true
    error.value = null
    try {
      // Ensure templateId is a number
      const templateIdNum = templateId ? parseInt(templateId, 10) : null
      
      console.log('Generating statement with:', {
        templateId: templateIdNum,
        dealIds,
        awardIds,
        lawyerIds,
        dealIdsLength: dealIds.length,
        awardIdsLength: awardIds.length,
        lawyerIdsLength: lawyerIds.length
      })
      
      const response = await dataService.generateStatement({
        templateId: templateIdNum,
        dealIds,
        awardIds,
        lawyerIds,
        settings: settings.value
      })
      
      console.log('Generated response:', {
        contentLength: response.data.content?.length,
        hasTemplate: !!response.data.template,
        dealsCount: response.data.deals?.length,
        awardsCount: response.data.awards?.length,
        lawyersCount: response.data.lawyers?.length
      })
      
      generatedContent.value = response.data.content
      selectedTemplateId.value = templateIdNum
      editedContent.value = '' // Clear any previous edits
      isEditing.value = false
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error generating statement:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveStatement(title, description, dealIds, awardIds, lawyerIds, content) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.saveStatement({
        title,
        description,
        dealIds,
        awardIds,
        lawyerIds,
        settings: settings.value,
        content,
        templateId: selectedTemplateId.value
      })
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStatement(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.updateStatement(id, data)
      if (currentStatement.value && currentStatement.value.id === id) {
        currentStatement.value = { ...currentStatement.value, ...response.data }
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function startEditing() {
    isEditing.value = true
    // Initialize editedContent with current display content
    if (currentStatement.value) {
      editedContent.value = currentStatement.value.display_content || currentStatement.value.edited_content || currentStatement.value.generated_content || ''
    } else {
      editedContent.value = generatedContent.value
    }
  }

  function cancelEditing() {
    isEditing.value = false
    // Revert to original content
    if (currentStatement.value) {
      editedContent.value = currentStatement.value.display_content || currentStatement.value.generated_content || ''
    } else {
      editedContent.value = generatedContent.value
    }
  }

  async function saveEdits(statementId) {
    loading.value = true
    error.value = null
    try {
      await updateStatement(statementId, {
        edited_content: editedContent.value,
        status: 'edited'
      })
      isEditing.value = false
      // Refresh current statement
      await fetchStatementById(statementId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStatements(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getStatements(filters)
      statements.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching statements:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatementById(id) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getStatementById(id)
      currentStatement.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
  }

  function clearGeneratedContent() {
    generatedContent.value = ''
  }

  return {
    // State
    statements,
    currentStatement,
    generatedContent,
    editedContent,
    isEditing,
    selectedTemplateId,
    templates,
    settings,
    loading,
    error,
    // Actions
    fetchTemplates,
    generateStatement,
    saveStatement,
    updateStatement,
    fetchStatements,
    fetchStatementById,
    updateSettings,
    clearGeneratedContent,
    startEditing,
    cancelEditing,
    saveEdits
  }
})
