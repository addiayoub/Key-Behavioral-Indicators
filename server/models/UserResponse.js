// models/UserResponse.js
const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    answerId: {
      type: Number,
      required: true
    },
    answerText: String,
    answerTextAng: String,
    score: {
      type: Number,
      required: true
    },
    questionText: String,
    questionTextAng: String,
    category: String,
    categoryAng: String,
    categoryShort: String,
    categoryAngShort: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'user_responses' });

module.exports = mongoose.model('UserResponse', userResponseSchema);