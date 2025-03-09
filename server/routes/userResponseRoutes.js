const express = require('express');
const router = express.Router();
const userResponseController = require('../controllers/userResponseController');

// Route principale qui sauvegarde toutes les données
router.post('/', userResponseController.saveUserResponses);

// Route qui récupère toutes les données combinées
router.get('/:userId', userResponseController.getUserResults);

// Routes spécifiques pour chaque type de données
router.get('/:userId/responses', userResponseController.getUserResponses);
router.get('/:userId/category-scores', userResponseController.getUserCategoryScores);
router.get('/:userId/total-score', userResponseController.getUserTotalScore);
router.get('/:userId/key-responses', userResponseController.getUserKeyResponses);

module.exports = router;