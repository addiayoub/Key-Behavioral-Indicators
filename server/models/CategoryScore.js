const mongoose = require('mongoose');

const categoryScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: String,
  categoryAng: String,
  categoryShort: String,
  categoryAngShort: String,
  score: Number,
  rawScore: Number,
  maxPossible: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'category_scores' });
module.exports = mongoose.model('CategoryScore', categoryScoreSchema);