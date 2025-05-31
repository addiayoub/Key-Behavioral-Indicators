const express = require('express');
const router = express.Router();
const userResponseController = require('../controllers/userResponseController');

router.post('/responses', userResponseController.saveUserResponses);

module.exports = router;