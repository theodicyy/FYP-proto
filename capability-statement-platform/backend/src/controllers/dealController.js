import dealService from '../services/dealService.js';

class DealController {
  async getDeals(req, res) {
    const filters = {
      industry: req.query.industry,
      practice_group: req.query.practice_group,
      deal_date: req.query.deal_date ? parseInt(req.query.deal_date, 10) : undefined,
      source_system: req.query.source_system
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const deals = await dealService.getDeals(filters);
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });
  }

  async getDealById(req, res) {
    const { id } = req.params;
    const deal = await dealService.getDealById(parseInt(id, 10));
    res.json({
      success: true,
      data: deal
    });
  }

  async createDeal(req, res) {
    const deal = await dealService.createDeal(req.body);
    res.status(201).json({
      success: true,
      data: { id: deal }
    });
  }

  async updateDeal(req, res) {
    const { id } = req.params;
    const deal = await dealService.updateDeal(parseInt(id, 10), req.body);
    res.json({
      success: true,
      data: deal
    });
  }

  async deleteDeal(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    await dealService.deleteDeal(parseInt(id, 10), userId);
    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  }
}

export default new DealController();
