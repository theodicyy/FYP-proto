import awardService from '../services/awardService.js';

class AwardController {
  async getAwards(req, res) {
    const filters = {
      award_year: req.query.award_year ? parseInt(req.query.award_year, 10) : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const awards = await awardService.getAwards(filters);
    res.json({
      success: true,
      data: awards,
      count: awards.length
    });
  }

  async getAwardById(req, res) {
    const { id } = req.params;
    const award = await awardService.getAwardById(parseInt(id, 10));
    res.json({
      success: true,
      data: award
    });
  }

  async createAward(req, res) {
    const award = await awardService.createAward(req.body);
    res.status(201).json({
      success: true,
      data: { id: award }
    });
  }

  async updateAward(req, res) {
    const { id } = req.params;
    const award = await awardService.updateAward(parseInt(id, 10), req.body);
    res.json({
      success: true,
      data: award
    });
  }

  async deleteAward(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    await awardService.deleteAward(parseInt(id, 10), userId);
    res.json({
      success: true,
      message: 'Award deleted successfully'
    });
  }
}

export default new AwardController();
