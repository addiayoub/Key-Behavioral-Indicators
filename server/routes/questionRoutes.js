// questionRoutes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/category/:category', questionController.getQuestionsByCategory);

module.exports = router;