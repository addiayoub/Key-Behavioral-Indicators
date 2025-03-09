const mongoose = require('mongoose');

const totalScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  score: Number,
  rawScore: Number,
  maxPossible: Number,
  // Scores calculés après application des pondérations KBI
  kbiScores: {
    profile: String,
    Pr: Number,
    Co: Number,
    Op: Number,
    Ad: Number,
    Ci: Number,
    KBICONSO: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'total_scores' });

module.exports = mongoose.model('TotalScore', totalScoreSchema);