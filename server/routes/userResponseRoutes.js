const express = require('express');
const router = express.Router();
const userResponseController = require('../controllers/userResponseController');

// Routes pour les réponses utilisateur
router.post('/', userResponseController.saveUserResponses);
router.get('/:userId', userResponseController.getUserResults);

module.exports = router;