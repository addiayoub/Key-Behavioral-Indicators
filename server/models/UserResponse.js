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
  // Nouvelles propriétés pour stocker les réponses clés en français et en anglais
  keyResponses: {
    industry: String,         // Réponse à la question 6 (secteur d'activité) en français
    industryAng: String,      // Réponse à la question 6 en anglais
    organizationType: String, // Réponse à la question 8 (type d'organisation) en français
    organizationTypeAng: String, // Réponse à la question 8 en anglais
    changePhase: String,      // Réponse à la question 9 (phase de changement) en français
    changePhaseAng: String    // Réponse à la question 9 en anglais
  },
  // Scores calculés après application des pondérations KBI
  kbiScores: {
    profile: String,      // Combinaison des 3 réponses utilisées pour la pondération (en anglais)
    Pr: Number,           // Score pondéré pour Pr (Préparation)
    Co: Number,           // Score pondéré pour Co (Compréhension)
    Op: Number,           // Score pondéré pour Op (Opération)
    Ad: Number,           // Score pondéré pour Ad (Adoption)
    Ci: Number,           // Score pondéré pour Ci (Amélioration continue)
    KBICONSO: Number      // Score KBI total (somme des scores pondérés)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'user_responses' });

module.exports = mongoose.model('UserResponse', userResponseSchema);