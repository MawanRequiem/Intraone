// controllers/adminController.js
const AdminModel = require('../models/adminModel');

const AdminController = {
  async loginAdmin(req, res) {
    const { email, password } = req.body;

    try {
      const admin = await AdminModel.getAdminByEmailAndPassword(email, password);

      if (admin) {
        res.json({ success: true, admin });
      } else {
        res.status(401).json({ success: false, message: 'Email atau password salah.' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
  }
};

module.exports = AdminController;
