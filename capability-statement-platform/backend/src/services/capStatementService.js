import capStatementRepository from '../repositories/capStatementRepository.js';
import templateService from './templateService.js';
import dealService from './dealService.js';
import awardService from './awardService.js';
import lawyerService from './lawyerService.js';
import { logger } from '../utils/logger.js';

class CapStatementService {
  async generateStatement(data) {
    try {
      const { templateId, dealIds = [], awardIds = [], lawyerIds = [], settings = {} } = data;

      // Convert templateId to number if it's a string
      const templateIdNum = templateId ? parseInt(templateId, 10) : null;

      logger.info('Generating statement with data', {
        templateId: templateIdNum,
        dealIds,
        awardIds,
        lawyerIds,
        dealIdsLength: dealIds.length,
        awardIdsLength: awardIds.length,
        lawyerIdsLength: lawyerIds.length
      });

      // Fetch selected items
      const deals = dealIds.length > 0 ? await dealService.getDealsByIds(dealIds) : [];
      const awards = awardIds.length > 0 ? await awardService.getAwardsByIds(awardIds) : [];
      const lawyers = lawyerIds.length > 0 
        ? await Promise.all(lawyerIds.map(id => lawyerService.getLawyerById(parseInt(id, 10))))
        : [];

      logger.info('Fetched items', {
        dealsCount: deals.length,
        awardsCount: awards.length,
        lawyersCount: lawyers.length
      });

      // Load template if provided
      let content;
      let template = null;
      
      if (templateIdNum) {
        template = await templateService.getTemplateById(templateIdNum);
        logger.info('Loaded template', { templateId: templateIdNum, templateName: template.name });
        
        // Filter data based on settings if provided
        let filteredDeals = deals;
        let filteredAwards = awards;
        let filteredLawyers = lawyers;
        
        if (settings.includeDeals === false) {
          filteredDeals = [];
        }
        if (settings.includeAwards === false) {
          filteredAwards = [];
        }
        if (settings.includeLawyers === false) {
          filteredLawyers = [];
        }
        
        // Populate template with selected data
        content = templateService.populateTemplate(template.content, {
          deals: filteredDeals,
          awards: filteredAwards,
          lawyers: filteredLawyers
        });
        
        logger.info('Template populated', { 
          contentLength: content.length,
          dealsUsed: filteredDeals.length,
          awardsUsed: filteredAwards.length,
          lawyersUsed: filteredLawyers.length
        });
      } else {
        // Fallback to old format if no template
        logger.info('No template provided, using fallback format');
        content = this.formatStatementContent(deals, awards, lawyers, settings);
      }

      logger.info('Generated capability statement', {
        templateId: templateIdNum,
        dealCount: deals.length,
        awardCount: awards.length,
        lawyerCount: lawyers.length,
        contentLength: content.length
      });

      return {
        content,
        template,
        deals,
        awards,
        lawyers,
        settings
      };
    } catch (error) {
      logger.error('Error generating statement', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  formatStatementContent(deals, awards, lawyers, settings) {
    let content = '';

    // Header
    content += 'CAPABILITY STATEMENT\n';
    content += '===================\n\n';

    // Practice Overview
    if (settings.includeLawyers !== false && lawyers.length > 0) {
      content += 'OUR TEAM\n';
      content += '--------\n';
      lawyers.forEach(lawyer => {
        content += `${lawyer.first_name} ${lawyer.last_name}, ${lawyer.title || 'Attorney'}\n`;
        if (lawyer.practice_group) {
          content += `Practice Group: ${lawyer.practice_group}\n`;
        }
        if (lawyer.bio) {
          content += `${lawyer.bio}\n`;
        }
        content += '\n';
      });
    }

    // Deals Section
    if (settings.includeDeals !== false && deals.length > 0) {
      content += 'RECENT TRANSACTIONS\n';
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
    }

    // Awards Section
    if (settings.includeAwards !== false && awards.length > 0) {
      content += 'RECOGNITIONS & AWARDS\n';
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
    }

    // Footer
    content += '\n---\n';
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;

    return content;
  }

  async saveStatement(data, userId = null) {
    try {
      const { title, description, dealIds, awardIds, lawyerIds, settings, content, templateId } = data;

      // Create cap statement record with generated_content (immutable)
      const capStatementId = await capStatementRepository.create({
        title,
        description,
        status: 'draft',
        created_by: 'system',
        created_by_user_id: userId,
        template_id: templateId || null,
        generated_content: content || null,
        edited_content: null // Start with no edits
      });

      // Get latest version number
      const existingVersions = await capStatementRepository.getVersionsByCapStatementId(capStatementId);
      const nextVersion = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(v => v.version_number)) + 1
        : 1;

      // Create version record
      await capStatementRepository.createVersion({
        cap_statement_id: capStatementId,
        version_number: nextVersion,
        content: content || '',
        settings: settings || {},
        selected_deal_ids: dealIds || [],
        selected_award_ids: awardIds || [],
        selected_lawyer_ids: lawyerIds || []
      });

      logger.info('Saved capability statement', { capStatementId, version: nextVersion });

      return {
        id: capStatementId,
        version: nextVersion
      };
    } catch (error) {
      logger.error('Error saving statement', { error: error.message });
      throw error;
    }
  }

  async updateStatement(id, data) {
    try {
      const { title, description, edited_content, status } = data;
      
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (edited_content !== undefined) updateData.edited_content = edited_content;
      if (status !== undefined) updateData.status = status;

      const updated = await capStatementRepository.update(id, updateData);
      if (!updated) {
        const error = new Error('Capability statement not found');
        error.statusCode = 404;
        throw error;
      }

      logger.info('Updated capability statement', { id });
      return await this.getStatementById(id);
    } catch (error) {
      logger.error('Error updating statement', { error: error.message, id });
      throw error;
    }
  }

  async deleteStatement(id) {
    try {
      const deleted = await capStatementRepository.delete(id);
      if (!deleted) {
        const error = new Error('Capability statement not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted capability statement', { id });
      return deleted;
    } catch (error) {
      logger.error('Error deleting statement', { error: error.message, id });
      throw error;
    }
  }

  async getStatements(filters = {}, userId = null, isAdmin = false) {
    try {
      // If not admin, filter to only user's own statements
      if (!isAdmin && userId) {
        filters.created_by_user_id = userId;
      }
      
      const statements = await capStatementRepository.findAll(filters);
      
      // Get latest version for each statement
      const statementsWithVersions = await Promise.all(
        statements.map(async (stmt) => {
          const latestVersion = await capStatementRepository.getLatestVersion(stmt.id);
          return {
            ...stmt,
            latest_version: latestVersion
          };
        })
      );

      return statementsWithVersions;
    } catch (error) {
      logger.error('Error fetching statements', { error: error.message });
      throw error;
    }
  }

  async getStatementById(id) {
    try {
      const statement = await capStatementRepository.findById(id);
      if (!statement) {
        const error = new Error('Capability statement not found');
        error.statusCode = 404;
        throw error;
      }

      const versions = await capStatementRepository.getVersionsByCapStatementId(id);
      const latestVersion = versions.length > 0 ? versions[0] : null;

      // Determine which content to display: edited_content takes precedence
      const displayContent = statement.edited_content || statement.generated_content || '';

      return {
        ...statement,
        display_content: displayContent, // Content to display (edited if exists, else generated)
        versions,
        latest_version: latestVersion
      };
    } catch (error) {
      logger.error('Error fetching statement by ID', { error: error.message, id });
      throw error;
    }
  }
}

export default new CapStatementService();
