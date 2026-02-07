import api from './api'

// ==========================
// Auth Token Helper
// ==========================
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// ==========================
// Data Service
// ==========================
export const dataService = {
  // ======================
  // Authentication
  // ======================
  async login(credentials) {
    return await api.post('/auth/login', credentials)
  },

  async logout() {
    return await api.post('/auth/logout')
  },

  async getCurrentUser() {
    return await api.get('/auth/me')
  },

  // ======================
  // Lawyers (KEPT – future / admin use)
  // ======================
  async getLawyers(filters = {}) {
    const params = new URLSearchParams()
    if (filters.practice_group) params.append('practice_group', filters.practice_group)
    if (filters.source_system) params.append('source_system', filters.source_system)

    const queryString = params.toString()
    const url = `/lawyers${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async getLawyerById(id) {
    return await api.get(`/lawyers/${id}`)
  },

  async createLawyer(data) {
    return await api.post('/lawyers', data)
  },

  async updateLawyer(id, data) {
    return await api.put(`/lawyers/${id}`, data)
  },

  async deleteLawyer(id) {
    return await api.delete(`/lawyers/${id}`)
  },

  // ======================
  // Deals (KEPT – future / admin use)
  // ======================
  async getDeals(filters = {}) {
    const params = new URLSearchParams()
    if (filters.industry) params.append('industry', filters.industry)
    if (filters.practice_group) params.append('practice_group', filters.practice_group)
    if (filters.deal_year) params.append('deal_year', filters.deal_year)
    if (filters.source_system) params.append('source_system', filters.source_system)

    const queryString = params.toString()
    const url = `/deals${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async getDealById(id) {
    return await api.get(`/deals/${id}`)
  },

  async createDeal(data) {
    return await api.post('/deals', data)
  },

  async updateDeal(id, data) {
    return await api.put(`/deals/${id}`, data)
  },

  async deleteDeal(id) {
    return await api.delete(`/deals/${id}`)
  },

  // ======================
  // Awards (KEPT – future / admin use)
  // ======================
  async getAwards(filters = {}) {
    const params = new URLSearchParams()
    if (filters.industry) params.append('industry', filters.industry)
    if (filters.practice_group) params.append('practice_group', filters.practice_group)
    if (filters.award_year) params.append('award_year', filters.award_year)
    if (filters.source_system) params.append('source_system', filters.source_system)

    const queryString = params.toString()
    const url = `/awards${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async getAwardById(id) {
    return await api.get(`/awards/${id}`)
  },

  async createAward(data) {
    return await api.post('/awards', data)
  },

  async updateAward(id, data) {
    return await api.put(`/awards/${id}`, data)
  },

  async deleteAward(id) {
    return await api.delete(`/awards/${id}`)
  },

  // ======================
  // Simple Templates
  // ======================
  async getTemplates() {
    return await api.get('/templates')
  },

  async getTemplateById(id) {
    return await api.get(`/templates/${id}`)
  },

  async createTemplate(data) {
    return await api.post('/templates', data)
  },

  async updateTemplate(id, data) {
    return await api.put(`/templates/${id}`, data)
  },

  async deleteTemplate(id) {
    return await api.delete(`/templates/${id}`)
  },

  // ======================
  // Structured Templates (KEPT)
  // ======================
  async getTemplateDefinitions(includeInactive = false) {
    const params = new URLSearchParams()
    if (includeInactive) params.append('includeInactive', 'true')

    const queryString = params.toString()
    const url = `/template-definitions${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async getTemplateDefinitionById(id) {
    return await api.get(`/template-definitions/${id}`)
  },

  async getTemplateDefinitionByName(name) {
    return await api.get(`/template-definitions/name/${encodeURIComponent(name)}`)
  },

  async getTemplateDefinitionWithContent(id) {
    return await api.get(`/template-definitions/${id}/with-content`)
  },

  async getTemplateContent(id, filters = {}) {
    const params = new URLSearchParams()
    if (filters.page_number) params.append('page_number', filters.page_number)
    if (filters.section_id) params.append('section_id', filters.section_id)
    if (filters.is_enabled !== undefined) params.append('is_enabled', filters.is_enabled)

    const queryString = params.toString()
    const url = `/template-definitions/${id}/content${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async createTemplateDefinition(data) {
    return await api.post('/template-definitions', data)
  },

  async updateTemplateDefinition(id, data) {
    return await api.put(`/template-definitions/${id}`, data)
  },

  async deleteTemplateDefinition(id) {
    return await api.delete(`/template-definitions/${id}`)
  },

  async updateTemplateContent(templateId, pageNumber, sectionId, elementId, contentValue) {
    return await api.put(
      `/template-definitions/${templateId}/content/${pageNumber}/${sectionId}/${elementId}`,
      { content_value: contentValue }
    )
  },

  async updateTemplateContentBatch(templateId, updates) {
    return await api.put(`/template-definitions/${templateId}/content`, { updates })
  },

  async upsertTemplateContent(templateId, content) {
    return await api.put(`/template-definitions/${templateId}/content/upsert`, content)
  },

  async setTemplateContentEnabled(templateId, pageNumber, sectionId, elementId, enabled) {
    return await api.put(
      `/template-definitions/${templateId}/content/${pageNumber}/${sectionId}/${elementId}/enabled`,
      { enabled }
    )
  },

  // ======================
  // Image Uploads (KEPT)
  // ======================
  async uploadTemplateImage(templateId, formData) {
    return await api.post(`/template-definitions/${templateId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  async uploadStatementImage(statementId, formData) {
    return await api.post(`/cap-statements/${statementId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // ======================
  // Capability Statements (UPDATED FLOW)
  // ======================

  /**
   * Generate cap statement using:
   * - selected template
   * - manual UI fields
   * - (future) parsed Word doc data
   */
async generateStatement(manualFields) {
  return api.post(
    '/cap-statements/generate',
    { manualFields },
    {
      responseType: 'blob'
    }
  )
},


  async saveStatement(data) {
    return await api.post('/cap-statements', data)
  },

  async updateStatement(id, data) {
    return await api.put(`/cap-statements/${id}`, data)
  },

  async deleteStatement(id) {
    return await api.delete(`/cap-statements/${id}`)
  },

  async getStatements(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)

    const queryString = params.toString()
    const url = `/cap-statements${queryString ? `?${queryString}` : ''}`
    return await api.get(url)
  },

  async getStatementById(id) {
    return await api.get(`/cap-statements/${id}`)
  },

  // ======================
  // Versions (KEPT)
  // ======================
  async createVersion(capStatementId, content, versionName = null) {
    return await api.post(`/cap-statements/${capStatementId}/versions`, {
      content,
      versionName
    })
  },

  async updateVersion(capStatementId, versionId, content, versionName = undefined) {
    return await api.put(
      `/cap-statements/${capStatementId}/versions/${versionId}`,
      { content, versionName }
    )
  },

  async renameVersion(capStatementId, versionId, versionName) {
    return await api.put(
      `/cap-statements/${capStatementId}/versions/${versionId}`,
      { versionName }
    )
  },

  // ======================
  // NEW – Word Document Upload
  // ======================
  async uploadMarketingWordDoc(formData) {
    return await api.post('/cap-statements/upload-doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default dataService
