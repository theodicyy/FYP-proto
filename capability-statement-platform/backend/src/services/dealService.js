import dealRepository from '../repositories/dealRepository.js';
import { logger } from '../utils/logger.js';

class DealService {
  async getDeals(filters = {}) {
    try {
      const deals = await dealRepository.findAll(filters);
      logger.info('Retrieved deals', { count: deals.length, filters });
      return deals;
    } catch (error) {
      logger.error('Error in deal service', { error: error.message });
      throw error;
    }
  }

  async getDealById(id) {
    try {
      const deal = await dealRepository.findById(id);
      if (!deal) {
        const error = new Error('Deal not found');
        error.statusCode = 404;
        throw error;
      }
      return deal;
    } catch (error) {
      logger.error('Error fetching deal by ID in service', { error: error.message, id });
      throw error;
    }
  }

  async getDealsByIds(ids) {
    try {
      const deals = await dealRepository.findByIds(ids);
      return deals;
    } catch (error) {
      logger.error('Error fetching deals by IDs in service', { error: error.message, ids });
      throw error;
    }
  }

  async createDeal(data) {
    try {
      if (!data.deal_name) {
        const error = new Error('Deal name is required');
        error.statusCode = 400;
        throw error;
      }
      const id = await dealRepository.create(data);
      logger.info('Created deal', { id, name: data.deal_name });
      return id;
    } catch (error) {
      logger.error('Error creating deal in service', { error: error.message });
      throw error;
    }
  }

  async updateDeal(id, data) {
    try {
      const updated = await dealRepository.update(id, data);
      if (!updated) {
        const error = new Error('Deal not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Updated deal', { id });
      return await this.getDealById(id);
    } catch (error) {
      logger.error('Error updating deal in service', { error: error.message, id });
      throw error;
    }
  }

  async deleteDeal(id, userId = null) {
    try {
      const deleted = await dealRepository.delete(id, userId);
      if (!deleted) {
        const error = new Error('Deal not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted deal', { id, userId });
      return deleted;
    } catch (error) {
      logger.error('Error deleting deal in service', { error: error.message, id });
      throw error;
    }
  }
}

export default new DealService();
