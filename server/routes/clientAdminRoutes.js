const express = require('express');
const router = express.Router();
const clientAdminController = require('../controllers/clientAdminController');

router.post('/login', clientAdminController.login);
router.get('/:clientId/dashboard', clientAdminController.getDashboardData);

module.exports = router;