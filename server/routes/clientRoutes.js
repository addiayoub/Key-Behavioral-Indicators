const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authController = require('../controllers/authController');

// Routes publiques (avant le middleware d'authentification)
router.get('/:id', clientController.getClientById);

// Routes protégées pour les admins clients
router.use(authController.protect, authController.restrictTo('client-admin'));

// Routes existantes
router.get('/:id/employees', clientController.getEmployees);
router.post('/:id/employees/responses', clientController.getEmployeeResponses);

// Nouvelles routes pour EmployeeResponse
router.get('/:id/responses', clientController.getEmployeeResponsesFromEmployeeResponse);
router.get('/responses/:sessionId', clientController.getResponseBySessionId);

module.exports = router;