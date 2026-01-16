import authService from '../services/authService.js';

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }

    try {
      const result = await authService.login(email, password);
      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            roleType: result.user.roleType
          },
          token: result.token,
          expiresAt: result.expiresAt
        }
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.token);
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  async getCurrentUser(req, res) {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        roleType: req.user.roleType
      }
    });
  }
}

export default new AuthController();
