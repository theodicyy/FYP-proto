import lawyerRepository from '../repositories/lawyerRepository.js';
import { logger } from '../utils/logger.js';

class LawyerService {
  async getLawyers(filters = {}) {
    try {
      const lawyers = await lawyerRepository.findAll(filters);
      logger.info('Retrieved lawyers', { count: lawyers.length, filters });
      return lawyers;
    } catch (error) {
      logger.error('Error in lawyer service', { error: error.message });
      throw error;
    }
  }

  async getLawyersByIds(ids = []) {
    try {
      const lawyers = await lawyerRepository.findByIds(ids);
      logger.info('Retrieved lawyers by IDs', { count: lawyers.length, idsCount: ids.length });
      return lawyers;
    } catch (error) {
      logger.error('Error fetching lawyers by IDs in service', { error: error.message });
      throw error;
    }
  }


  async getLawyersByDealId(dealId) {
    try {
      const lawyers = await lawyerRepository.findByDealId(dealId);
      return lawyers;
    } catch (error) {
      logger.error('Error fetching lawyers by deal ID in service', { error: error.message, dealId });
      throw error;
    }
  }

  async createLawyer(data) {
    try {
      if (!data.first_name || !data.last_name) {
        const error = new Error('First name and last name are required');
        error.statusCode = 400;
        throw error;
      }
      const id = await lawyerRepository.create(data);
      logger.info('Created lawyer', { id, name: `${data.first_name} ${data.last_name}` });
      return id;
    } catch (error) {
      logger.error('Error creating lawyer in service', { error: error.message });
      throw error;
    }
  }

  async updateLawyer(id, data) {
    try {
      const updated = await lawyerRepository.update(id, data);
      if (!updated) {
        const error = new Error('Lawyer not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Updated lawyer', { id });
      return await this.getLawyerById(id);
    } catch (error) {
      logger.error('Error updating lawyer in service', { error: error.message, id });
      throw error;
    }
  }

  async deleteLawyer(id, userId = null) {
    try {
      const deleted = await lawyerRepository.delete(id, userId);
      if (!deleted) {
        const error = new Error('Lawyer not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted lawyer', { id, userId });
      return deleted;
    } catch (error) {
      logger.error('Error deleting lawyer in service', { error: error.message, id });
      throw error;
    }
  }
}

export default new LawyerService();
