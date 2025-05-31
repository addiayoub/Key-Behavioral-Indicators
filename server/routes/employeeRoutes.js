const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController.js');

router.post('/login', authController.employeeLogin);
router.post('/responses', employeeController.saveResponse);

module.exports = router;