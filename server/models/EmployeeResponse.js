const mongoose = require('mongoose');

const employeeResponseSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: false // Permettre null pour les utilisateurs anonymes
  },
  employeeId: { 
    type: mongoose.Schema.Types.Mixed, // Peut être ObjectId ou String (pour sessions temporaires)
    required: false 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: {
    type: String, // Pour les utilisateurs anonymes (kbi_user_id)
    required: false
  },
  // Structure similaire à UserResponse
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    answerId: Number,
    answerText: String,
    answerTextAng: String,
    questionText: String,
    questionTextAng: String,
    score: {
      type: Number,
      required: true
    },
    category: String,
    categoryAng: String,
    categoryShort: String,
    categoryAngShort: String
  }],
  categoryScores: [{
    category: String,
    categoryAng: String,
    categoryShort: String,
    categoryAngShort: String,
    score: Number,        // Score en pourcentage
    rawScore: Number,     // Score brut
    maxPossible: Number   // Maximum possible
  }],
  score: Number,          // Score total en pourcentage
  rawScore: Number,       // Score brut total
  maxPossible: Number,    // Maximum possible total
  profile: String,        // Profile text pour KBI
  // Scores KBI pondérés
  Pr: Number,
  Co: Number,
  Op: Number,
  Ad: Number,
  Ci: Number,
  KBICONSO: Number,
  // Réponses clés pour référence
  keyResponses: {
    industry: String,
    industryAng: String,
    organizationType: String,
    organizationTypeAng: String,
    changePhase: String,
    changePhaseAng: String
  },
  employeeName: {
    type: String,
    required: false
  },
  employeeEmail: {
    type: String,
    required: false
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    completionTime: Number, // Temps pris pour compléter en secondes
    language: { type: String, default: 'fr' },
    ponderationFound: Boolean,
    ponderationId: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances de recherche
employeeResponseSchema.index({ clientId: 1, createdAt: -1 });
employeeResponseSchema.index({ sessionId: 1 });
employeeResponseSchema.index({ userId: 1 });
employeeResponseSchema.index({ employeeId: 1 });

// Middleware pour mettre à jour updatedAt
employeeResponseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour obtenir un résumé des réponses
employeeResponseSchema.methods.getResponseSummary = function() {
  if (!this.responses || !Array.isArray(this.responses)) {
    return { total: 0, categories: [] };
  }
  
  const categories = {};
  this.responses.forEach(response => {
    if (response.category) {
      if (!categories[response.category]) {
        categories[response.category] = 0;
      }
      categories[response.category]++;
    }
  });
  
  return {
    total: this.responses.length,
    categories: Object.keys(categories).map(cat => ({
      name: cat,
      count: categories[cat]
    }))
  };
};

// Méthode pour obtenir les scores KBI
employeeResponseSchema.methods.getKBIScores = function() {
  return {
    profile: this.profile,
    Pr: this.Pr,
    Co: this.Co,
    Op: this.Op,
    Ad: this.Ad,
    Ci: this.Ci,
    KBICONSO: this.KBICONSO
  };
};

// Méthode pour obtenir les scores par catégorie
employeeResponseSchema.methods.getCategoryScores = function() {
  return this.categoryScores || [];
};

// Méthode pour obtenir le score total
employeeResponseSchema.methods.getTotalScore = function() {
  return {
    score: this.score,
    rawScore: this.rawScore,
    maxPossible: this.maxPossible
  };
};

module.exports = mongoose.model('EmployeeResponse', employeeResponseSchema);//////////////