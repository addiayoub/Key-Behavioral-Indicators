    const express = require('express');
    const router = express.Router();
    const questionController = require('../controllers/questionController');

    // Routes pour les questions
    router.get('/', questionController.getAllQuestions);
    router.get('/category/:category', questionController.getQuestionsByCategory);
    router.post('/', questionController.createQuestion);

    module.exports = router;