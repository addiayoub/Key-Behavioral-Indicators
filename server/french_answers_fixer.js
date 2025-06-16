const mongoose = require('mongoose');
const UserResponse = require('./models/UserResponse');
const KeyResponse = require('./models/KeyResponse');
const Question = require('./models/Question');

const DB_URI = 'mongodb://localhost:27017/survey_db';

class FrenchAnswersFixer {
  constructor() {
    this.replacedCount = 0;
    this.errorCount = 0;
    this.processedCount = 0;
    this.questionsMap = new Map();
    this.fixedAnswers = [];
    
    // Mappings manuels pour les réponses courantes français -> anglais
    this.manualMappings = {
      // Question 1 - Genre
      'Femme': 'Woman',
      'Homme': 'Man',
      'Autre': 'Other',
      'Préfère ne pas répondre': 'Prefer not to answer',
      
      // Question 2 - Position managériale  
      'Oui': 'Yes',
      'Non': 'No',
      
      // Réponses d'échelle courantes
      'Très faible': 'Very low',
      'Faible': 'Low',
      'Plutôt faible': 'Rather low',
      'Moyen': 'Medium',
      'Plutôt élevé': 'Rather high',
      'Élevé': 'High',
      'Très élevé': 'Very high',
      
      'Jamais': 'Never',
      'Rarement': 'Rarely',
      'Parfois': 'Sometimes',
      'Souvent': 'Often',
      'Toujours': 'Always',
      
      'Pas du tout d\'accord': 'Strongly disagree',
      'Pas d\'accord': 'Disagree',
      'Neutre': 'Neutral',
      'D\'accord': 'Agree',
      'Tout à fait d\'accord': 'Strongly agree',
      
      'Très insatisfait': 'Very dissatisfied',
      'Insatisfait': 'Dissatisfied',
      'Plutôt insatisfait': 'Rather dissatisfied',
      'Plutôt satisfait': 'Rather satisfied',
      'Satisfait': 'Satisfied',
      'Très satisfait': 'Very satisfied',
      
      // Industries courantes
      'Technologie': 'Technology',
      'Finance': 'Finance',
      'Santé': 'Healthcare',
      'Éducation': 'Education',
      'Commerce': 'Retail',
      'Industrie': 'Manufacturing',
      'Services': 'Services',
      'Gouvernement': 'Government',
      'ONG': 'NGO',
      'Autre': 'Other',
      
      // Types d'organisation
      'Entreprise privée': 'Private company',
      'Entreprise publique': 'Public company',
      'Organisation gouvernementale': 'Government organization',
      'Organisation à but non lucratif': 'Non-profit organization',
      'Startup': 'Startup',
      'PME': 'SME',
      'Grande entreprise': 'Large enterprise',
      
      // Phases de changement
      'Pré-changement': 'Pre-change',
      'Début de changement': 'Early change',
      'Milieu de changement': 'Mid-change',
      'Fin de changement': 'Late change',
      'Post-changement': 'Post-change',
      'Changement continu': 'Continuous change'
    };
  }

  async connect() {
    try {
      await mongoose.connect(DB_URI);
      console.log('✅ Connexion à MongoDB établie');
    } catch (error) {
      console.error('❌ Erreur de connexion à MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }

  async loadQuestions() {
    console.log('📚 Chargement des questions...');
    try {
      const questions = await Question.find({});
      console.log(`📊 ${questions.length} questions chargées`);
      
      questions.forEach(question => {
        this.questionsMap.set(question.id, question);
      });
      
      console.log('✅ Questions mises en cache');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des questions:', error);
      throw error;
    }
  }

  /**
   * Trouve la traduction anglaise d'une réponse française
   */
  findEnglishAnswer(questionId, frenchAnswer) {
    if (!frenchAnswer) return null;

    // 1. Essayer le mapping manuel d'abord
    if (this.manualMappings[frenchAnswer]) {
      return this.manualMappings[frenchAnswer];
    }

    // 2. Chercher dans les réponses de la question
    const question = this.questionsMap.get(questionId);
    if (question && question.answers && question.answersAng) {
      const frenchIndex = question.answers.findIndex(ans => ans === frenchAnswer);
      if (frenchIndex !== -1 && question.answersAng[frenchIndex]) {
        return question.answersAng[frenchIndex];
      }
      
      // 3. Recherche approximative (ignorer la casse et les accents)
      const normalizedFrench = this.normalizeText(frenchAnswer);
      const frenchIndexApprox = question.answers.findIndex(ans => 
        this.normalizeText(ans) === normalizedFrench
      );
      if (frenchIndexApprox !== -1 && question.answersAng[frenchIndexApprox]) {
        return question.answersAng[frenchIndexApprox];
      }
    }

    return null;
  }

  /**
   * Normalise le texte pour la comparaison
   */
  normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
               .trim();
  }

  /**
   * Détecte si une réponse est en français
   */
  isFrenchAnswer(answer) {
    if (!answer || typeof answer !== 'string') return false;
    
    // Vérifier si c'est dans nos mappings manuels
    if (this.manualMappings[answer]) return true;
    
    // Mots français courants
    const frenchWords = [
      'Femme', 'Homme', 'Oui', 'Non', 'Autre', 'Très', 'Plutôt', 'Pas du tout',
      'Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours', 'Accord', 'Neutre',
      'Insatisfait', 'Satisfait', 'Technologie', 'Santé', 'Éducation', 'Commerce',
      'Industrie', 'Services', 'Gouvernement', 'Entreprise', 'Organisation',
      'Pré-changement', 'Début', 'Milieu', 'Fin', 'Post-changement', 'Continu'
    ];
    
    return frenchWords.some(word => answer.includes(word));
  }

  /**
   * Scanner pour trouver toutes les réponses françaises
   */
  async scanFrenchAnswers() {
    console.log('\n🔍 SCAN DES RÉPONSES FRANÇAISES...');
    
    const userResponses = await UserResponse.find({});
    const frenchAnswers = new Set();
    
    for (const userResponse of userResponses) {
      if (userResponse.responses && Array.isArray(userResponse.responses)) {
        for (const response of userResponse.responses) {
          if (this.isFrenchAnswer(response.answerTextAng)) {
            frenchAnswers.add(`Q${response.questionId}: "${response.answerTextAng}"`);
          }
          if (this.isFrenchAnswer(response.answerText)) {
            frenchAnswers.add(`Q${response.questionId}: "${response.answerText}"`);
          }
        }
      }
      
      // Vérifier aussi les keyResponses
      if (userResponse.keyResponses) {
        if (this.isFrenchAnswer(userResponse.keyResponses.industry)) {
          frenchAnswers.add(`Industry: "${userResponse.keyResponses.industry}"`);
        }
        if (this.isFrenchAnswer(userResponse.keyResponses.organizationType)) {
          frenchAnswers.add(`OrgType: "${userResponse.keyResponses.organizationType}"`);
        }
        if (this.isFrenchAnswer(userResponse.keyResponses.changePhase)) {
          frenchAnswers.add(`ChangePhase: "${userResponse.keyResponses.changePhase}"`);
        }
      }
    }
    
    console.log(`\n📊 Réponses françaises uniques trouvées: ${frenchAnswers.size}`);
    Array.from(frenchAnswers).forEach(answer => {
      console.log(`  🇫🇷 ${answer}`);
    });
    
    return frenchAnswers;
  }

  /**
   * Corriger les réponses françaises dans UserResponse
   */
  async fixUserResponses() {
    console.log('\n🔧 CORRECTION DES RÉPONSES FRANÇAISES...');
    
    const userResponses = await UserResponse.find({});
    
    for (const userResponse of userResponses) {
      let hasChanges = false;
      
      if (userResponse.responses && Array.isArray(userResponse.responses)) {
        for (const response of userResponse.responses) {
          // Corriger answerText
          if (this.isFrenchAnswer(response.answerText)) {
            const englishAnswer = this.findEnglishAnswer(response.questionId, response.answerText);
            if (englishAnswer) {
              console.log(`  🔧 Q${response.questionId} answerText: "${response.answerText}" → "${englishAnswer}"`);
              response.answerText = englishAnswer;
              this.fixedAnswers.push({
                questionId: response.questionId,
                from: response.answerText,
                to: englishAnswer
              });
              hasChanges = true;
            }
          }
          
          // Corriger answerTextAng
          if (this.isFrenchAnswer(response.answerTextAng)) {
            const englishAnswer = this.findEnglishAnswer(response.questionId, response.answerTextAng);
            if (englishAnswer) {
              console.log(`  🔧 Q${response.questionId} answerTextAng: "${response.answerTextAng}" → "${englishAnswer}"`);
              response.answerTextAng = englishAnswer;
              hasChanges = true;
            }
          }
        }
      }
      
      // Corriger les keyResponses
      if (userResponse.keyResponses) {
        if (this.isFrenchAnswer(userResponse.keyResponses.industry)) {
          const englishIndustry = this.findEnglishAnswer(6, userResponse.keyResponses.industry);
          if (englishIndustry) {
            console.log(`  🔧 Industry: "${userResponse.keyResponses.industry}" → "${englishIndustry}"`);
            userResponse.keyResponses.industry = englishIndustry;
            userResponse.keyResponses.industryAng = englishIndustry;
            hasChanges = true;
          }
        }
        
        if (this.isFrenchAnswer(userResponse.keyResponses.organizationType)) {
          const englishOrgType = this.findEnglishAnswer(8, userResponse.keyResponses.organizationType);
          if (englishOrgType) {
            console.log(`  🔧 OrgType: "${userResponse.keyResponses.organizationType}" → "${englishOrgType}"`);
            userResponse.keyResponses.organizationType = englishOrgType;
            userResponse.keyResponses.organizationTypeAng = englishOrgType;
            hasChanges = true;
          }
        }
        
        if (this.isFrenchAnswer(userResponse.keyResponses.changePhase)) {
          const englishChangePhase = this.findEnglishAnswer(9, userResponse.keyResponses.changePhase);
          if (englishChangePhase) {
            console.log(`  🔧 ChangePhase: "${userResponse.keyResponses.changePhase}" → "${englishChangePhase}"`);
            userResponse.keyResponses.changePhase = englishChangePhase;
            userResponse.keyResponses.changePhaseAng = englishChangePhase;
            hasChanges = true;
          }
        }
      }
      
      if (hasChanges) {
        try {
          await userResponse.save();
          this.replacedCount++;
          console.log(`  ✅ UserResponse ${userResponse.userId} corrigé`);
        } catch (error) {
          console.error(`  ❌ Erreur sauvegarde ${userResponse.userId}:`, error.message);
          this.errorCount++;
        }
      }
      
      this.processedCount++;
    }
  }

  /**
   * Corriger les réponses françaises dans KeyResponse
   */
  async fixKeyResponses() {
    console.log('\n🔧 CORRECTION DES KEYRESPONSES...');
    
    const keyResponses = await KeyResponse.find({});
    
    for (const keyResponse of keyResponses) {
      let hasChanges = false;
      
      if (this.isFrenchAnswer(keyResponse.industry)) {
        const englishIndustry = this.findEnglishAnswer(6, keyResponse.industry);
        if (englishIndustry) {
          console.log(`  🔧 Industry: "${keyResponse.industry}" → "${englishIndustry}"`);
          keyResponse.industry = englishIndustry;
          keyResponse.industryAng = englishIndustry;
          hasChanges = true;
        }
      }
      
      if (this.isFrenchAnswer(keyResponse.organizationType)) {
        const englishOrgType = this.findEnglishAnswer(8, keyResponse.organizationType);
        if (englishOrgType) {
          console.log(`  🔧 OrgType: "${keyResponse.organizationType}" → "${englishOrgType}"`);
          keyResponse.organizationType = englishOrgType;
          keyResponse.organizationTypeAng = englishOrgType;
          hasChanges = true;
        }
      }
      
      if (this.isFrenchAnswer(keyResponse.changePhase)) {
        const englishChangePhase = this.findEnglishAnswer(9, keyResponse.changePhase);
        if (englishChangePhase) {
          console.log(`  🔧 ChangePhase: "${keyResponse.changePhase}" → "${englishChangePhase}"`);
          keyResponse.changePhase = englishChangePhase;
          keyResponse.changePhaseAng = englishChangePhase;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        try {
          await keyResponse.save();
          this.replacedCount++;
          console.log(`  ✅ KeyResponse ${keyResponse.userId} corrigé`);
        } catch (error) {
          console.error(`  ❌ Erreur sauvegarde ${keyResponse.userId}:`, error.message);
          this.errorCount++;
        }
      }
      
      this.processedCount++;
    }
  }

  /**
   * Générer un script SQL pour ajouter les mappings manquants
   */
  generateMappingSuggestions() {
    console.log('\n💡 SUGGESTIONS DE MAPPINGS POUR LES QUESTIONS:');
    
    // Suggestions basées sur les réponses trouvées
    const suggestions = [
      { questionId: 1, fr: 'Femme', en: 'Woman' },
      { questionId: 1, fr: 'Homme', en: 'Man' },
      { questionId: 2, fr: 'Oui', en: 'Yes' },
      { questionId: 2, fr: 'Non', en: 'No' }
    ];
    
    suggestions.forEach(suggestion => {
      console.log(`db.questions.updateOne(
        { id: ${suggestion.questionId} },
        {
          $push: {
            answers: "${suggestion.fr}",
            answersAng: "${suggestion.en}"
          }
        }
      );`);
    });
  }

  displaySummary() {
    console.log('\n📋 RÉSUMÉ DES CORRECTIONS:');
    console.log(`📊 Documents traités: ${this.processedCount}`);
    console.log(`✅ Documents corrigés: ${this.replacedCount}`);
    console.log(`❌ Erreurs: ${this.errorCount}`);
    console.log(`🔧 Réponses corrigées: ${this.fixedAnswers.length}`);
    
    if (this.fixedAnswers.length > 0) {
      console.log('\n🔧 Détail des corrections:');
      this.fixedAnswers.forEach(fix => {
        console.log(`  Q${fix.questionId}: "${fix.from}" → "${fix.to}"`);
      });
    }
  }
}

async function main() {
  const fixer = new FrenchAnswersFixer();
  
  try {
    await fixer.connect();
    await fixer.loadQuestions();
    
    // Scanner d'abord
    const frenchAnswers = await fixer.scanFrenchAnswers();
    
    if (frenchAnswers.size === 0) {
      console.log('🎉 Aucune réponse française trouvée!');
      return;
    }
    
    console.log('\n💾 Sauvegarde recommandée: mongodump --db survey_db --out backup_answers_fix');
    
    // Corriger les réponses
    await fixer.fixUserResponses();
    await fixer.fixKeyResponses();
    
    // Scanner à nouveau
    console.log('\n🔍 SCAN FINAL...');
    const remainingFrench = await fixer.scanFrenchAnswers();
    
    fixer.displaySummary();
    
    if (remainingFrench.size > 0) {
      console.log(`\n⚠️  ${remainingFrench.size} réponses françaises persistent.`);
      fixer.generateMappingSuggestions();
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  } finally {
    await fixer.disconnect();
  }
}

module.exports = FrenchAnswersFixer;

if (require.main === module) {
  main().catch(console.error);
}