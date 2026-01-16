import templateRepository from '../repositories/templateRepository.js';
import { logger } from '../utils/logger.js';

class TemplateService {
  async getTemplates() {
    try {
      const templates = await templateRepository.findAll();
      logger.info('Retrieved templates', { count: templates.length });
      return templates;
    } catch (error) {
      logger.error('Error in template service', { error: error.message });
      throw error;
    }
  }

  async getTemplateById(id) {
    try {
      const template = await templateRepository.findById(id);
      if (!template) {
        const error = new Error('Template not found');
        error.statusCode = 404;
        throw error;
      }
      return template;
    } catch (error) {
      logger.error('Error fetching template by ID in service', { error: error.message, id });
      throw error;
    }
  }

  async createTemplate(data) {
    try {
      if (!data.name || !data.content) {
        const error = new Error('Template name and content are required');
        error.statusCode = 400;
        throw error;
      }
      const id = await templateRepository.create(data);
      logger.info('Created template', { id, name: data.name });
      return id;
    } catch (error) {
      logger.error('Error creating template in service', { error: error.message });
      throw error;
    }
  }

  async updateTemplate(id, data) {
    try {
      const updated = await templateRepository.update(id, data);
      if (!updated) {
        const error = new Error('Template not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Updated template', { id });
      return updated;
    } catch (error) {
      logger.error('Error updating template in service', { error: error.message, id });
      throw error;
    }
  }

  async deleteTemplate(id) {
    try {
      const deleted = await templateRepository.delete(id);
      if (!deleted) {
        const error = new Error('Template not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted template', { id });
      return deleted;
    } catch (error) {
      logger.error('Error deleting template in service', { error: error.message, id });
      throw error;
    }
  }

  formatPlaceholder(placeholder, data) {
    switch (placeholder) {
      case '{{lawyers}}':
        return this.formatLawyers(data.lawyers || []);
      case '{{deals}}':
        return this.formatDeals(data.deals || []);
      case '{{awards}}':
        return this.formatAwards(data.awards || []);
      case '{{date}}':
        return new Date().toLocaleDateString();
      default:
        return '';
    }
  }

  formatLawyers(lawyers) {
    if (lawyers.length === 0) return '';
    
    let content = 'OUR TEAM\n';
    content += '--------\n';
    lawyers.forEach(lawyer => {
      content += `${lawyer.first_name} ${lawyer.last_name}`;
      if (lawyer.title) {
        content += `, ${lawyer.title}`;
      }
      content += '\n';
      if (lawyer.practice_group) {
        content += `Practice Group: ${lawyer.practice_group}\n`;
      }
      if (lawyer.bio) {
        content += `${lawyer.bio}\n`;
      }
      content += '\n';
    });
    return content;
  }

  formatDeals(deals) {
    if (deals.length === 0) return '';
    
    let content = 'RECENT TRANSACTIONS\n';
    content += '------------------\n';
    deals.forEach(deal => {
      content += `${deal.deal_name}\n`;
      if (deal.client_name) {
        content += `Client: ${deal.client_name}\n`;
      }
      if (deal.deal_value) {
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: deal.deal_currency || 'USD',
          minimumFractionDigits: 0
        }).format(deal.deal_value);
        content += `Value: ${formattedValue}\n`;
      }
      if (deal.deal_year) {
        content += `Year: ${deal.deal_year}\n`;
      }
      if (deal.deal_description) {
        content += `${deal.deal_description}\n`;
      }
      content += '\n';
    });
    return content;
  }

  formatAwards(awards) {
    if (awards.length === 0) return '';
    
    let content = 'RECOGNITIONS & AWARDS\n';
    content += '---------------------\n';
    awards.forEach(award => {
      content += `${award.award_name}\n`;
      if (award.awarding_organization) {
        content += `Awarded by: ${award.awarding_organization}\n`;
      }
      if (award.award_year) {
        content += `Year: ${award.award_year}\n`;
      }
      if (award.description) {
        content += `${award.description}\n`;
      }
      content += '\n';
    });
    return content;
  }

  populateTemplate(templateContent, data) {
    let populatedContent = templateContent;
    
    // Log for debugging
    logger.debug('Populating template with data', {
      lawyersCount: data.lawyers?.length || 0,
      dealsCount: data.deals?.length || 0,
      awardsCount: data.awards?.length || 0
    });
    
    // Replace placeholders - use global flag to replace all occurrences
    const lawyersContent = this.formatPlaceholder('{{lawyers}}', data);
    const dealsContent = this.formatPlaceholder('{{deals}}', data);
    const awardsContent = this.formatPlaceholder('{{awards}}', data);
    const dateContent = this.formatPlaceholder('{{date}}', data);
    
    populatedContent = populatedContent.replace(/\{\{lawyers\}\}/g, lawyersContent);
    populatedContent = populatedContent.replace(/\{\{deals\}\}/g, dealsContent);
    populatedContent = populatedContent.replace(/\{\{awards\}\}/g, awardsContent);
    populatedContent = populatedContent.replace(/\{\{date\}\}/g, dateContent);
    
    logger.debug('Template populated', {
      lawyersContentLength: lawyersContent.length,
      dealsContentLength: dealsContent.length,
      awardsContentLength: awardsContent.length
    });
    
    return populatedContent;
  }
}

export default new TemplateService();
