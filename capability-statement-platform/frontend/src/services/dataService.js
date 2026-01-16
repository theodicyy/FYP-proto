import api from './api'

// Set auth token in API client
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const dataService = {
  // Authentication
  async login(credentials) {
    return await api.post('/auth/login', credentials)
  },

  async logout() {
    return await api.post('/auth/logout')
  },

  async getCurrentUser() {
    return await api.get('/auth/me')
  },
  // Lawyers
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

  // Deals
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

  // Awards
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

  // Templates
  async getTemplates() {
    return await api.get('/templates')
  },

  async getTemplateById(id) {
    return await api.get(`/templates/${id}`)
  },

  // Capability Statements
  async generateStatement(data) {
    return await api.post('/cap-statements/generate', data)
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
  }
}

export default dataService
