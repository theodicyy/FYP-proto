import lawyerService from '../services/lawyerService.js';

class LawyerController {
  async getLawyers(req, res) {
    const filters = {
      practice_group: req.query.practice_group,
      source_system: req.query.source_system
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const lawyers = await lawyerService.getLawyers(filters);
    res.json({
      success: true,
      data: lawyers,
      count: lawyers.length
    });
  }

  async getLawyerById(req, res) {
    const { id } = req.params;
    const lawyer = await lawyerService.getLawyerById(parseInt(id, 10));
    res.json({
      success: true,
      data: lawyer
    });
  }

  async createLawyer(req, res) {
    const lawyer = await lawyerService.createLawyer(req.body);
    res.status(201).json({
      success: true,
      data: { id: lawyer }
    });
  }

  async updateLawyer(req, res) {
    const { id } = req.params;
    const lawyer = await lawyerService.updateLawyer(parseInt(id, 10), req.body);
    res.json({
      success: true,
      data: lawyer
    });
  }

  async deleteLawyer(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    await lawyerService.deleteLawyer(parseInt(id, 10), userId);
    res.json({
      success: true,
      message: 'Lawyer deleted successfully'
    });
  }
}

export default new LawyerController();
