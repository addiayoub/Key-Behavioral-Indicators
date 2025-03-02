const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    answerId: {
      type: Number,      // Index de la réponse sélectionnée (0, 1, 2, etc.)
      required: true
    },
    answerText: String,  // Texte de la réponse sélectionnée
    answerTextAng: String, // Texte de la réponse en anglais
    score: {
      type: Number,      // Note associée à la réponse
      required: true
    },
    questionText: String, // Texte de la question
    questionTextAng: String, // Texte de la question en anglais
    category: String,
    categoryAng: String,
    categoryShort: String,     // Abréviation de la catégorie (2 lettres) en français
    categoryAngShort: String   // Abréviation de la catégorie (2 lettres) en anglais
  }],
  categoryScores: [{
    category: String,
    categoryAng: String,
    categoryShort: String,     // Abréviation de la catégorie (2 lettres) en français
    categoryAngShort: String,  // Abréviation de la catégorie (2 lettres) en anglais
    score: Number,       // Score en pourcentage: (score * 100) / maxPossible
    rawScore: Number,    // Score brut avant calcul du pourcentage
    maxPossible: Number  // Score maximum possible pour cette catégorie
  }],
  totalScore: {
    score: Number,       // Score total en pourcentage
    rawScore: Number,    // Score brut total avant calcul du pourcentage
    maxPossible: Number  // Score maximum possible pour toutes les catégories
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'user_responses' });

module.exports = mongoose.model('UserResponse', userResponseSchema);