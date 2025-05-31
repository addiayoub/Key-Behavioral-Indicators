const express = require('express');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/authController');
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      message: 'Authentification réussie'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/login', authController.adminLogin);
router.post('/client/login', authController.clientAdminLogin);
router.post('/employee/login', authController.employeeLogin);
router.get('/guest', authController.guestAccess);

module.exports = router;