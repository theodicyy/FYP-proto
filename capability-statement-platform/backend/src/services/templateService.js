import templateRepository from '../repositories/templateRepository.js'
import { logger } from '../utils/logger.js'

class TemplateService {
  // =====================================================
  // CRUD
  // =====================================================

  async getTemplates() {
    try {
      const templates = await templateRepository.findAll()
      logger.info('Retrieved templates', { count: templates.length })
      return templates
    } catch (error) {
      logger.error('Error retrieving templates', { error: error.message })
      throw error
    }
  }

  async getTemplateById(id) {
    const template = await templateRepository.findById(id)
    if (!template) {
      const error = new Error('Template not found')
      error.statusCode = 404
      throw error
    }
    return template
  }

  async createTemplate(data) {
    if (!data.name || !data.content) {
      const error = new Error('Template name and content are required')
      error.statusCode = 400
      throw error
    }
    return templateRepository.create(data)
  }

  async updateTemplate(id, data) {
    const updated = await templateRepository.update(id, data)
    if (!updated) {
      const error = new Error('Template not found')
      error.statusCode = 404
      throw error
    }
    return updated
  }

  async deleteTemplate(id) {
    const deleted = await templateRepository.delete(id)
    if (!deleted) {
      const error = new Error('Template not found')
      error.statusCode = 404
      throw error
    }
    return deleted
  }

  // =====================================================
  // LEGACY FORMATTERS (DO NOT REMOVE)
  // =====================================================

  formatLawyers(lawyers = []) {
    if (!lawyers.length) return ''

    let output = '<h2>OUR TEAM</h2>'
    lawyers.forEach(l => {
      output += `<p><strong>${l.first_name} ${l.last_name}</strong>`
      if (l.title) output += `, ${l.title}`
      output += '</p>'
      if (l.practice_group) {
        output += `<p>Practice Group: ${l.practice_group}</p>`
      }
      if (l.bio) {
        output += `<p>${l.bio}</p>`
      }
    })

    return output
  }

  formatDeals(deals = []) {
    if (!deals.length) return ''

    let output = '<h2>RECENT TRANSACTIONS</h2>'
    deals.forEach(d => {
      output += `<p><strong>${d.deal_name}</strong></p>`
      if (d.client_name) output += `<p>Client: ${d.client_name}</p>`
      if (d.deal_value) {
        output += `<p>Value: ${d.deal_value}</p>`
      }
      if (d.deal_year) output += `<p>Year: ${d.deal_year}</p>`
      if (d.deal_description) {
        output += `<p>${d.deal_description}</p>`
      }
    })

    return output
  }

  formatAwards(awards = []) {
    if (!awards.length) return ''

    let output = '<h2>RECOGNITIONS & AWARDS</h2>'
    awards.forEach(a => {
      output += `<p><strong>${a.award_name}</strong></p>`
      if (a.awarding_organization) {
        output += `<p>${a.awarding_organization}</p>`
      }
      if (a.award_year) output += `<p>Year: ${a.award_year}</p>`
      if (a.description) output += `<p>${a.description}</p>`
    })

    return output
  }

  // =====================================================
  // TEMPLATE POPULATION ENGINE (CORE)
  // =====================================================

populateTemplate(templateContent, data = {}) {
  const normalizedData = {}
  Object.entries(data).forEach(([k, v]) => {
    normalizedData[k.toLowerCase()] = v
  })

  let output = templateContent

  logger.debug('Populating template', {
    dataKeys: Object.keys(normalizedData)
  })

  // 1️⃣ Conditionals
  output = output.replace(
   /{{#if\s+([\w_]+)\s*}}([\s\S]*?){{\s*\/if\s*}}/g,
    (match, key, inner) => {
      const val = normalizedData[key.toLowerCase()]
      const truthy =
        val === true ||
        val === 'true' ||
        val === 'on' ||
        val === 1
      return truthy ? inner : ''
    }
  )

  // 2️⃣ Legacy placeholders
  output = output.replace(/\{\{lawyers\}\}/g, this.formatLawyers(normalizedData.lawyers))
  output = output.replace(/\{\{deals\}\}/g, this.formatDeals(normalizedData.deals))
  output = output.replace(/\{\{awards\}\}/g, this.formatAwards(normalizedData.awards))
  output = output.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())

  // 3️⃣ Variables
  Object.entries(normalizedData).forEach(([key, value]) => {
    const safeValue =
      value === null || value === undefined ? '' : String(value)
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    output = output.replace(regex, safeValue)
  })

  // 4️⃣ Cleanup
output = output.replace(/{{\s*\/if\s*}}/g, '')

  return output
}

}

export default new TemplateService()
