import awardRepository from '../repositories/awardRepository.js';
import { logger } from '../utils/logger.js';

class AwardService {
  async getAwards(filters = {}) {
    try {
      const awards = await awardRepository.findAll(filters);
      logger.info('Retrieved awards', { count: awards.length, filters });
      return awards;
    } catch (error) {
      logger.error('Error in award service', { error: error.message });
      throw error;
    }
  }

  async getAwardsByIds(ids = []) {
    try {
      const awards = await awardRepository.findByIds(ids);
      logger.info('Retrieved awards by IDs', { count: awards.length, idsCount: ids.length });
      return awards;
    } catch (error) {
      logger.error('Error fetching awards by IDs in service', { error: error.message });
      throw error;
    }
  }



  async createAward(data) {
    try {
      if (!data.award_name) {
        const error = new Error('Award name is required');
        error.statusCode = 400;
        throw error;
      }
      const id = await awardRepository.create(data);
      logger.info('Created award', { id, name: data.award_name });
      return id;
    } catch (error) {
      logger.error('Error creating award in service', { error: error.message });
      throw error;
    }
  }

  async updateAward(id, data) {
    try {
      const updated = await awardRepository.update(id, data);
      if (!updated) {
        const error = new Error('Award not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Updated award', { id });
      return await this.getAwardById(id);
    } catch (error) {
      logger.error('Error updating award in service', { error: error.message, id });
      throw error;
    }
  }

  async deleteAward(id, userId = null) {
    try {
      const deleted = await awardRepository.delete(id, userId);
      if (!deleted) {
        const error = new Error('Award not found');
        error.statusCode = 404;
        throw error;
      }
      logger.info('Deleted award', { id, userId });
      return deleted;
    } catch (error) {
      logger.error('Error deleting award in service', { error: error.message, id });
      throw error;
    }
  }
}

export default new AwardService();
