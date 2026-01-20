import capStatementRepository from '../repositories/capStatementRepository.js';
import templateService from './templateService.js';
import templateDefinitionService from './templateDefinitionService.js';
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
        // Try to load as simple template first
        try {
          template = await templateService.getTemplateById(templateIdNum);
          logger.info('Loaded simple template', { templateId: templateIdNum, templateName: template.name });
          
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
        } catch (simpleTemplateError) {
          // If simple template not found, try structured template
          if (simpleTemplateError.statusCode === 404) {
            try {
              const structuredTemplate = await templateDefinitionService.getTemplateDefinitionById(templateIdNum);
              logger.info('Loaded structured template', { templateId: templateIdNum, templateName: structuredTemplate.name });
              
              // Get the document content from structured template
              const templateContent = await templateDefinitionService.getTemplateContent(templateIdNum, {
                section_id: 'document'
              });
              
              // Find the full_content entry
              const documentEntry = templateContent.find(
                entry => entry.section_id === 'document' && entry.element_id === 'full_content'
              );
              
              if (!documentEntry || !documentEntry.content_value) {
                throw new Error('Structured template has no content');
              }
              
              // Parse the JSON document structure
              let documentData;
              try {
                documentData = JSON.parse(documentEntry.content_value);
              } catch (parseError) {
                logger.error('Error parsing structured template content', { error: parseError.message });
                throw new Error('Invalid structured template content format');
              }
              
              // Extract HTML content from document structure (pages array with content fields)
              let templateHtml = '';
              if (documentData.pages && Array.isArray(documentData.pages)) {
                templateHtml = documentData.pages.map(page => page.content || '').join('\n');
              } else {
                templateHtml = documentEntry.content_value; // Fallback to raw content
              }
              
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
              
              // Populate template with selected data (works on HTML content too)
              content = templateService.populateTemplate(templateHtml, {
                deals: filteredDeals,
                awards: filteredAwards,
                lawyers: filteredLawyers
              });
              
              template = {
                id: structuredTemplate.id,
                name: structuredTemplate.name,
                description: structuredTemplate.description,
                type: 'structured'
              };
              
              logger.info('Structured template populated', { 
                contentLength: content.length,
                dealsUsed: filteredDeals.length,
                awardsUsed: filteredAwards.length,
                lawyersUsed: filteredLawyers.length
              });
            } catch (structuredTemplateError) {
              logger.error('Error loading structured template', { 
                error: structuredTemplateError.message,
                templateId: templateIdNum
              });
              throw new Error(`Template not found: ${templateIdNum}`);
            }
          } else {
            throw simpleTemplateError;
          }
        }
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
      // First, delete all versions associated with this capability statement
      const deletedVersionsCount = await capStatementRepository.deleteVersionsByCapStatementId(id);
      logger.info('Deleted versions for capability statement', { id, versionsDeleted: deletedVersionsCount });
      
      // Then delete the capability statement itself
      const deleted = await capStatementRepository.delete(id);
      if (!deleted) {
        const error = new Error('Capability statement not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted capability statement', { id, versionsDeleted: deletedVersionsCount });
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

  async createVersion(capStatementId, content, versionName = null, userId = null) {
    try {
      // Get existing versions to determine next version number
      const existingVersions = await capStatementRepository.getVersionsByCapStatementId(capStatementId);
      const nextVersionNumber = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(v => v.version_number)) + 1
        : 1;

      // Get the statement to preserve settings and selected IDs from the latest version
      const statement = await capStatementRepository.findById(capStatementId);
      if (!statement) {
        const error = new Error('Capability statement not found');
        error.statusCode = 404;
        throw error;
      }

      // Get latest version to preserve settings and selected IDs
      const latestVersion = existingVersions.length > 0 ? existingVersions[0] : null;
      
      // MySQL JSON columns are returned as objects by mysql2, not strings
      // So we need to check if they're already parsed or need parsing
      const settings = latestVersion?.settings 
        ? (typeof latestVersion.settings === 'string' ? JSON.parse(latestVersion.settings) : latestVersion.settings)
        : {};
      const selectedDealIds = latestVersion?.selected_deal_ids
        ? (typeof latestVersion.selected_deal_ids === 'string' ? JSON.parse(latestVersion.selected_deal_ids) : latestVersion.selected_deal_ids)
        : [];
      const selectedAwardIds = latestVersion?.selected_award_ids
        ? (typeof latestVersion.selected_award_ids === 'string' ? JSON.parse(latestVersion.selected_award_ids) : latestVersion.selected_award_ids)
        : [];
      const selectedLawyerIds = latestVersion?.selected_lawyer_ids
        ? (typeof latestVersion.selected_lawyer_ids === 'string' ? JSON.parse(latestVersion.selected_lawyer_ids) : latestVersion.selected_lawyer_ids)
        : [];

      // Create new version
      const versionId = await capStatementRepository.createVersion({
        cap_statement_id: capStatementId,
        version_number: nextVersionNumber,
        version_name: versionName || null,
        content: content || '',
        settings: settings,
        selected_deal_ids: selectedDealIds,
        selected_award_ids: selectedAwardIds,
        selected_lawyer_ids: selectedLawyerIds
      });

      logger.info('Created new version', { capStatementId, versionNumber: nextVersionNumber, versionId });

      return await capStatementRepository.getVersionById(versionId);
    } catch (error) {
      logger.error('Error creating version', { error: error.message, capStatementId });
      throw error;
    }
  }

  async updateVersion(versionId, content, versionName = undefined) {
    try {
      // Get the version to verify it exists
      const version = await capStatementRepository.getVersionById(versionId);
      if (!version) {
        const error = new Error('Version not found');
        error.statusCode = 404;
        throw error;
      }

      // Update the version content and/or name
      const updateData = {};
      if (content !== undefined) {
        updateData.content = content;
      }
      if (versionName !== undefined) {
        updateData.version_name = versionName;
      }

      const updated = await capStatementRepository.updateVersion(versionId, updateData);

      if (!updated) {
        const error = new Error('Failed to update version');
        error.statusCode = 500;
        throw error;
      }

      logger.info('Updated version', { versionId });

      return await capStatementRepository.getVersionById(versionId);
    } catch (error) {
      logger.error('Error updating version', { error: error.message, versionId });
      throw error;
    }
  }
}

export default new CapStatementService();
