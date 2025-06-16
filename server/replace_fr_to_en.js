const mongoose = require('mongoose');
const UserResponse = require('./models/UserResponse');
const KeyResponse = require('./models/KeyResponse');
const Question = require('./models/Question');

// Configuration de la base de données
const DB_URI = 'mongodb://localhost:27017/survey_db';

class FrenchToEnglishReplacer {
  constructor() {
    this.replacedCount = 0;
    this.errorCount = 0;
    this.processedCount = 0;
    this.questionsMap = new Map();
    this.categoryMap = new Map(); // Nouveau: mapping des catégories FR->EN
    this.diagnostics = {
      frenchValuesFound: [],
      unmappedQuestions: [],
      categoryMappings: []
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

  /**
   * Charge toutes les questions et crée les mappings FR->EN
   */
  async loadQuestions() {
    console.log('📚 Chargement des questions...');
    try {
      const questions = await Question.find({});
      console.log(`📊 ${questions.length} questions chargées`);
      
      questions.forEach(question => {
        this.questionsMap.set(question.id, question);
        
        // Créer le mapping des catégories FR->EN
        if (question.category && question.categoryAng) {
          this.categoryMap.set(question.category, question.categoryAng);
          this.diagnostics.categoryMappings.push({
            fr: question.category,
            en: question.categoryAng
          });
        }
      });
      
      console.log('✅ Questions mises en cache');
      console.log(`🏷️  Mappings de catégories créés: ${this.categoryMap.size}`);
      
      // Afficher les mappings de catégories
      console.log('\n📋 MAPPINGS DE CATÉGORIES:');
      this.categoryMap.forEach((en, fr) => {
        console.log(`  "${fr}" → "${en}"`);
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des questions:', error);
      throw error;
    }
  }

  /**
   * Détecte si une valeur semble être en français
   */
  isFrenchValue(value) {
    if (!value || typeof value !== 'string') return false;
    
    // Mots-clés français courants dans les réponses
    const frenchIndicators = [
      'Très', 'très', 'Plutôt', 'plutôt', 'Pas du tout', 'pas du tout',
      'Jamais', 'jamais', 'Souvent', 'souvent', 'Toujours', 'toujours',
      'Beaucoup', 'beaucoup', 'Peu', 'peu', 'Énormément', 'enormement',
      'Assez', 'assez', 'Moyennement', 'moyennement', 'Faiblement', 'faiblement',
      'Complètement', 'completement', 'Partiellement', 'partiellement',
      'Oui', 'oui', 'Non', 'non', 'Peut-être', 'peut-etre',
      'Industrie', 'industrie', 'Organisation', 'organisation',
      'Entreprise', 'entreprise', 'Société', 'societe'
    ];
    
    return frenchIndicators.some(indicator => value.includes(indicator));
  }

  /**
   * Obtient la vraie réponse anglaise depuis le modèle Question
   */
  getEnglishAnswer(questionId, answerId, currentAnswerText) {
    const question = this.questionsMap.get(questionId);
    if (!question) {
      console.warn(`⚠️  Question ${questionId} non trouvée`);
      this.diagnostics.unmappedQuestions.push(questionId);
      return null;
    }

    // Si answerId est défini et valide
    if (answerId !== undefined && answerId !== null && 
        question.answersAng && question.answersAng[answerId]) {
      return question.answersAng[answerId];
    }

    // Si c'est une réponse personnalisée, essayer de la mapper
    if (currentAnswerText && question.answers && question.answersAng) {
      const frenchIndex = question.answers.findIndex(ans => ans === currentAnswerText);
      if (frenchIndex !== -1 && question.answersAng[frenchIndex]) {
        return question.answersAng[frenchIndex];
      }
      
      // Recherche approximative (ignorer la casse et les accents)
      const normalizedCurrent = this.normalizeText(currentAnswerText);
      const frenchIndexApprox = question.answers.findIndex(ans => 
        this.normalizeText(ans) === normalizedCurrent
      );
      if (frenchIndexApprox !== -1 && question.answersAng[frenchIndexApprox]) {
        return question.answersAng[frenchIndexApprox];
      }
    }

    // Si on détecte que c'est français mais qu'on ne trouve pas de mapping
    if (this.isFrenchValue(currentAnswerText)) {
      this.diagnostics.frenchValuesFound.push({
        questionId,
        value: currentAnswerText,
        type: 'answer'
      });
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
   * Obtient la vraie question anglaise depuis le modèle Question
   */
  getEnglishQuestion(questionId, currentQuestionText) {
    const question = this.questionsMap.get(questionId);
    if (!question) return null;
    
    // Si on détecte que c'est français mais qu'on n'a pas de mapping
    if (this.isFrenchValue(currentQuestionText) && !question.questionAng) {
      this.diagnostics.frenchValuesFound.push({
        questionId,
        value: currentQuestionText,
        type: 'question'
      });
    }
    
    return question.questionAng;
  }

  /**
   * Obtient la vraie catégorie anglaise
   */
  getEnglishCategory(questionId, currentCategory) {
    const question = this.questionsMap.get(questionId);
    let englishCategory = null;
    
    if (question && question.categoryAng) {
      englishCategory = question.categoryAng;
    } else if (currentCategory && this.categoryMap.has(currentCategory)) {
      englishCategory = this.categoryMap.get(currentCategory);
    }
    
    // Si on détecte que c'est français mais qu'on n'a pas de mapping
    if (this.isFrenchValue(currentCategory) && !englishCategory) {
      this.diagnostics.frenchValuesFound.push({
        questionId,
        value: currentCategory,
        type: 'category'
      });
    }
    
    return {
      category: englishCategory,
      categoryShort: englishCategory ? englishCategory.substring(0, 2) : null
    };
  }

  /**
   * Scan complet pour détecter toutes les valeurs françaises restantes
   */
  async scanForFrenchValues() {
    console.log('\n🔍 SCAN DES VALEURS FRANÇAISES RESTANTES...');
    
    const userResponses = await UserResponse.find({});
    let frenchCount = 0;
    
    for (const userResponse of userResponses) {
      if (userResponse.responses && Array.isArray(userResponse.responses)) {
        for (const response of userResponse.responses) {
          if (this.isFrenchValue(response.answerText)) {
            console.log(`🇫🇷 UserResponse ${userResponse.userId} - Q${response.questionId}: "${response.answerText}"`);
            frenchCount++;
          }
          if (this.isFrenchValue(response.questionText)) {
            console.log(`🇫🇷 UserResponse ${userResponse.userId} - Q${response.questionId} question: "${response.questionText}"`);
            frenchCount++;
          }
          if (this.isFrenchValue(response.category)) {
            console.log(`🇫🇷 UserResponse ${userResponse.userId} - Q${response.questionId} category: "${response.category}"`);
            frenchCount++;
          }
        }
      }
      
      if (userResponse.categoryScores && Array.isArray(userResponse.categoryScores)) {
        for (const categoryScore of userResponse.categoryScores) {
          if (this.isFrenchValue(categoryScore.category)) {
            console.log(`🇫🇷 UserResponse ${userResponse.userId} - CategoryScore: "${categoryScore.category}"`);
            frenchCount++;
          }
        }
      }
    }
    
    console.log(`\n📊 Total de valeurs françaises détectées: ${frenchCount}`);
    return frenchCount;
  }

  /**
   * Remplace les réponses françaises par leurs équivalents anglais dans UserResponse
   */
  async replaceUserResponses() {
    console.log('\n🔄 Début du remplacement des réponses utilisateur...');
    
    try {
      const userResponses = await UserResponse.find({});
      console.log(`📊 ${userResponses.length} documents UserResponse trouvés`);

      for (const userResponse of userResponses) {
        let hasChanges = false;
        
        if (userResponse.responses && Array.isArray(userResponse.responses)) {
          for (const response of userResponse.responses) {
            const questionId = response.questionId;
            
            // Remplacer answerText et answerTextAng
            const englishAnswer = this.getEnglishAnswer(questionId, response.answerId, response.answerText);
            if (englishAnswer && englishAnswer !== response.answerText) {
              console.log(`  🔄 Q${questionId} Answer: "${response.answerText}" → "${englishAnswer}"`);
              response.answerText = englishAnswer;
              response.answerTextAng = englishAnswer;
              hasChanges = true;
            }

            // Remplacer questionText et questionTextAng
            const englishQuestion = this.getEnglishQuestion(questionId, response.questionText);
            if (englishQuestion && englishQuestion !== response.questionText) {
              console.log(`  🔄 Q${questionId} Question: "${response.questionText}" → "${englishQuestion}"`);
              response.questionText = englishQuestion;
              response.questionTextAng = englishQuestion;
              hasChanges = true;
            }

            // Remplacer category et categoryAng
            const englishCategory = this.getEnglishCategory(questionId, response.category);
            if (englishCategory.category && englishCategory.category !== response.category) {
              console.log(`  🔄 Q${questionId} Category: "${response.category}" → "${englishCategory.category}"`);
              response.category = englishCategory.category;
              response.categoryAng = englishCategory.category;
              hasChanges = true;
            }

            // Remplacer categoryShort et categoryAngShort
            if (englishCategory.categoryShort && englishCategory.categoryShort !== response.categoryShort) {
              response.categoryShort = englishCategory.categoryShort;
              response.categoryAngShort = englishCategory.categoryShort;
              hasChanges = true;
            }
          }
        }

        // Traiter les categoryScores avec mapping amélioré
        if (userResponse.categoryScores && Array.isArray(userResponse.categoryScores)) {
          for (const categoryScore of userResponse.categoryScores) {
            let englishCategoryName = null;
            
            // Essayer d'abord le mapping direct
            if (this.categoryMap.has(categoryScore.category)) {
              englishCategoryName = this.categoryMap.get(categoryScore.category);
            } else {
              // Chercher dans les questions une catégorie correspondante
              const sampleQuestion = Array.from(this.questionsMap.values())
                .find(q => q.category === categoryScore.category || q.categoryAng === categoryScore.category);
              
              if (sampleQuestion && sampleQuestion.categoryAng) {
                englishCategoryName = sampleQuestion.categoryAng;
              }
            }
            
            if (englishCategoryName && categoryScore.category !== englishCategoryName) {
              console.log(`  🔄 CategoryScore: "${categoryScore.category}" → "${englishCategoryName}"`);
              categoryScore.category = englishCategoryName;
              categoryScore.categoryAng = englishCategoryName;
              categoryScore.categoryShort = englishCategoryName.substring(0, 2);
              categoryScore.categoryAngShort = englishCategoryName.substring(0, 2);
              hasChanges = true;
            }
          }
        }

        // Traiter les keyResponses
        if (userResponse.keyResponses) {
          hasChanges = await this.updateKeyResponsesInUserResponse(userResponse.keyResponses) || hasChanges;
        }

        // Sauvegarder si des changements ont été effectués
        if (hasChanges) {
          try {
            await userResponse.save();
            this.replacedCount++;
            console.log(`  ✅ UserResponse ${userResponse.userId} mis à jour`);
          } catch (error) {
            console.error(`  ❌ Erreur lors de la sauvegarde de ${userResponse.userId}:`, error.message);
            this.errorCount++;
          }
        }

        this.processedCount++;
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement des UserResponse:', error);
      throw error;
    }
  }

  /**
   * Met à jour les keyResponses avec les vraies valeurs anglaises
   */
  async updateKeyResponsesInUserResponse(keyResponses) {
    let hasChanges = false;
    
    // Question 6 - Industry
    const industryAnswer = this.getEnglishAnswer(6, null, keyResponses.industry);
    if (industryAnswer && keyResponses.industry !== industryAnswer) {
      console.log(`  🔄 Industry: "${keyResponses.industry}" → "${industryAnswer}"`);
      keyResponses.industry = industryAnswer;
      keyResponses.industryAng = industryAnswer;
      hasChanges = true;
    }

    // Question 8 - Organization Type
    const orgTypeAnswer = this.getEnglishAnswer(8, null, keyResponses.organizationType);
    if (orgTypeAnswer && keyResponses.organizationType !== orgTypeAnswer) {
      console.log(`  🔄 Organization Type: "${keyResponses.organizationType}" → "${orgTypeAnswer}"`);
      keyResponses.organizationType = orgTypeAnswer;
      keyResponses.organizationTypeAng = orgTypeAnswer;
      hasChanges = true;
    }

    // Question 9 - Change Phase
    const changePhaseAnswer = this.getEnglishAnswer(9, null, keyResponses.changePhase);
    if (changePhaseAnswer && keyResponses.changePhase !== changePhaseAnswer) {
      console.log(`  🔄 Change Phase: "${keyResponses.changePhase}" → "${changePhaseAnswer}"`);
      keyResponses.changePhase = changePhaseAnswer;
      keyResponses.changePhaseAng = changePhaseAnswer;
      hasChanges = true;
    }

    return hasChanges;
  }

  /**
   * Remplace les réponses françaises par leurs équivalents anglais dans KeyResponse
   */
  async replaceKeyResponses() {
    console.log('\n🔄 Début du remplacement des réponses clés...');
    
    try {
      const keyResponses = await KeyResponse.find({});
      console.log(`📊 ${keyResponses.length} documents KeyResponse trouvés`);

      for (const keyResponse of keyResponses) {
        let hasChanges = false;
        
        // Question 6 - Industry
        const industryAnswer = this.getEnglishAnswer(6, null, keyResponse.industry);
        if (industryAnswer && keyResponse.industry !== industryAnswer) {
          console.log(`  🔄 Industry: "${keyResponse.industry}" → "${industryAnswer}"`);
          keyResponse.industry = industryAnswer;
          keyResponse.industryAng = industryAnswer;
          hasChanges = true;
        }

        // Question 8 - Organization Type
        const orgTypeAnswer = this.getEnglishAnswer(8, null, keyResponse.organizationType);
        if (orgTypeAnswer && keyResponse.organizationType !== orgTypeAnswer) {
          console.log(`  🔄 Organization Type: "${keyResponse.organizationType}" → "${orgTypeAnswer}"`);
          keyResponse.organizationType = orgTypeAnswer;
          keyResponse.organizationTypeAng = orgTypeAnswer;
          hasChanges = true;
        }

        // Question 9 - Change Phase
        const changePhaseAnswer = this.getEnglishAnswer(9, null, keyResponse.changePhase);
        if (changePhaseAnswer && keyResponse.changePhase !== changePhaseAnswer) {
          console.log(`  🔄 Change Phase: "${keyResponse.changePhase}" → "${changePhaseAnswer}"`);
          keyResponse.changePhase = changePhaseAnswer;
          keyResponse.changePhaseAng = changePhaseAnswer;
          hasChanges = true;
        }

        if (hasChanges) {
          try {
            await keyResponse.save();
            this.replacedCount++;
            console.log(`  ✅ KeyResponse ${keyResponse.userId} mis à jour`);
          } catch (error) {
            console.error(`  ❌ Erreur lors de la sauvegarde de ${keyResponse.userId}:`, error.message);
            this.errorCount++;
          }
        }

        this.processedCount++;
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement des KeyResponse:', error);
      throw error;
    }
  }

  /**
   * Affiche les diagnostics détaillés
   */
  displayDiagnostics() {
    console.log('\n🔍 DIAGNOSTICS DÉTAILLÉS:');
    
    if (this.diagnostics.frenchValuesFound.length > 0) {
      console.log(`\n🇫🇷 Valeurs françaises non mappées trouvées: ${this.diagnostics.frenchValuesFound.length}`);
      this.diagnostics.frenchValuesFound.forEach(item => {
        console.log(`  Q${item.questionId} (${item.type}): "${item.value}"`);
      });
    }
    
    if (this.diagnostics.unmappedQuestions.length > 0) {
      console.log(`\n❓ Questions non trouvées: ${this.diagnostics.unmappedQuestions.length}`);
      console.log(`  Questions: ${this.diagnostics.unmappedQuestions.join(', ')}`);
    }
  }

  /**
   * Affiche un résumé des opérations effectuées
   */
  displaySummary() {
    console.log('\n📋 RÉSUMÉ DES OPÉRATIONS:');
    console.log(`📊 Documents traités: ${this.processedCount}`);
    console.log(`✅ Documents modifiés: ${this.replacedCount}`);
    console.log(`❌ Erreurs rencontrées: ${this.errorCount}`);
    
    if (this.errorCount === 0) {
      console.log('🎉 Toutes les opérations ont été effectuées avec succès!');
    } else {
      console.log('⚠️  Des erreurs ont été rencontrées. Vérifiez les logs ci-dessus.');
    }
  }

  /**
   * Effectue une sauvegarde avant les modifications
   */
  async createBackup() {
    console.log('💾 Création d\'une sauvegarde recommandée avant d\'exécuter ce script...');
    console.log('Commande suggérée: mongodump --db survey_db --out backup_avant_remplacement');
  }

  /**
   * Mode dry-run amélioré
   */
  async dryRun() {
    console.log('🔍 MODE DRY-RUN - Aucune modification ne sera appliquée\n');
    
    const userResponses = await UserResponse.find({}).limit(10);
    let potentialChanges = 0;
    
    for (const userResponse of userResponses) {
      if (userResponse.responses && Array.isArray(userResponse.responses)) {
        for (const response of userResponse.responses) {
          const englishAnswer = this.getEnglishAnswer(response.questionId, response.answerId, response.answerText);
          if (englishAnswer && englishAnswer !== response.answerText) {
            console.log(`  📝 Q${response.questionId} Answer: "${response.answerText}" → "${englishAnswer}"`);
            potentialChanges++;
          }
          
          const englishQuestion = this.getEnglishQuestion(response.questionId, response.questionText);
          if (englishQuestion && englishQuestion !== response.questionText) {
            console.log(`  📝 Q${response.questionId} Question: "${response.questionText}" → "${englishQuestion}"`);
            potentialChanges++;
          }
          
          const englishCategory = this.getEnglishCategory(response.questionId, response.category);
          if (englishCategory.category && englishCategory.category !== response.category) {
            console.log(`  📝 Q${response.questionId} Category: "${response.category}" → "${englishCategory.category}"`);
            potentialChanges++;
          }
        }
      }
    }

    console.log(`\n📊 Total des changements potentiels (échantillon): ${potentialChanges}`);
  }
}

// Fonction principale
async function main() {
  const replacer = new FrenchToEnglishReplacer();
  
  try {
    await replacer.connect();
    await replacer.loadQuestions();
    
    // Scanner d'abord pour voir l'état actuel
    console.log('\n🔍 SCAN INITIAL DES VALEURS FRANÇAISES...');
    const frenchValuesCount = await replacer.scanForFrenchValues();
    
    if (frenchValuesCount === 0) {
      console.log('🎉 Aucune valeur française détectée. Le remplacement semble déjà effectué.');
      return;
    }
    
    await replacer.createBackup();
    
    console.log('\nExécution du dry-run...');
    await replacer.dryRun();
    
    console.log('\n⚠️  ATTENTION: Ce script va modifier vos données!');
    console.log('Assurez-vous d\'avoir créé une sauvegarde avant de continuer.');
    
    console.log('\n🚀 Début des remplacements réels...');
    await replacer.replaceUserResponses();
    await replacer.replaceKeyResponses();
    
    // Scanner à nouveau après remplacement
    console.log('\n🔍 SCAN FINAL DES VALEURS FRANÇAISES...');
    const remainingFrenchValues = await replacer.scanForFrenchValues();
    
    replacer.displayDiagnostics();
    replacer.displaySummary();
    
    if (remainingFrenchValues > 0) {
      console.log(`\n⚠️  Il reste ${remainingFrenchValues} valeurs françaises. Vérifiez les diagnostics ci-dessus.`);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  } finally {
    await replacer.disconnect();
  }
}

module.exports = FrenchToEnglishReplacer;

if (require.main === module) {
  main().catch(console.error);
}