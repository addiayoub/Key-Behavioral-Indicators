const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authController = require('../controllers/authController');

router.use(authController.protect, authController.restrictTo('client-admin'));

router.get('/employees', clientController.getEmployees);
router.post('/employees/responses', clientController.getEmployeeResponses);

module.exports = router;