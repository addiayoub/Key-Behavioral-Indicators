const UserResponse = require('../models/UserResponse');
const CategoryScore = require('../models/CategoryScore');
const TotalScore = require('../models/TotalScore');
const KeyResponse = require('../models/KeyResponse');
const Question = require('../models/Question');
const Ponderation = require('../models/Ponderation');
const mongoose = require('mongoose');

const userResponseController = {
  // Enregistrer les réponses d'un utilisateur
  saveUserResponses: async (req, res) => {
    // Démarrer une session de transaction pour garantir l'atomicité
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { userId, responses } = req.body;
      
      if (!userId || !responses || !Array.isArray(responses)) {
        return res.status(400).json({ message: 'Données invalides' });
      }

      // Récupérer toutes les questions pour calculer les scores
      const allQuestions = await Question.find();
      const questionMap = new Map();
      allQuestions.forEach(q => questionMap.set(q.id, q));

      // Récupérer toutes les pondérations
      const allPonderations = await Ponderation.find();
      
      console.log(`Nombre de pondérations trouvées: ${allPonderations.length}`);
      
      if (allPonderations.length === 0) {
        console.warn("ATTENTION: Aucune pondération n'a été trouvée dans la base de données!");
      }

      // Extraire les réponses spécifiques (6, 8, 9)
      const keyResponses = {};
      const keyResponsesAng = {};
      
      for (const response of responses) {
        if ([6, 8, 9].includes(response.questionId)) {
          const question = questionMap.get(response.questionId);
          if (question) {
            // Stocker la version française
            const answerText = question.answers[response.answerId] || response.answerText;
            keyResponses[response.questionId] = answerText;
            
            // Stocker la version anglaise
            const answerTextAng = question.answersAng[response.answerId] || response.answerTextAng;
            keyResponsesAng[response.questionId] = answerTextAng;
            
            console.log(`Question ${response.questionId} (EN): ${answerTextAng}`);
          }
        }
      }

      // Trouver la pondération applicable
      let applicablePonderation = null;
      if (keyResponsesAng[6] && keyResponsesAng[8] && keyResponsesAng[9]) {
        const industry = keyResponsesAng[6].trim();
        const orgType = keyResponsesAng[8].trim();
        const changePhase = keyResponsesAng[9].trim();
        
        console.log("Recherche de pondération pour:", JSON.stringify([industry, orgType, changePhase]));
        
        // Vérifier validité des pondérations
        const matchingPonderations = allPonderations.filter(p => {
          if (!p.possibilite || !Array.isArray(p.possibilite) || p.possibilite.length < 3) {
            console.warn(`Pondération ${p.id} a une structure de possibilité invalide:`, p.possibilite);
            return false;
          }
          return true;
        });
        
        console.log(`Pondérations valides: ${matchingPonderations.length}`);
        
        // Recherche exacte
        applicablePonderation = allPonderations.find(p => 
          p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
          p.possibilite[0] === industry && 
          p.possibilite[1] === orgType && 
          p.possibilite[2] === changePhase
        );
        
        // Si aucune correspondance exacte, essayer insensible à la casse
        if (!applicablePonderation) {
          console.log("Aucune correspondance exacte, essai avec recherche insensible à la casse...");
          applicablePonderation = allPonderations.find(p => 
            p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
            p.possibilite[0].toLowerCase() === industry.toLowerCase() && 
            p.possibilite[1].toLowerCase() === orgType.toLowerCase() && 
            p.possibilite[2].toLowerCase() === changePhase.toLowerCase()
          );
        }
        
        if (!applicablePonderation) {
          console.log("AUCUNE PONDÉRATION TROUVÉE! Voici les détails pour le débogage:");
          console.log("Combinaisons disponibles dans la base de données:");
          allPonderations.forEach(p => {
            if (p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3) {
              console.log(`ID: ${p.id}, Combinaison: ${JSON.stringify(p.possibilite)}`);
            }
          });
        } else {
          console.log(`Pondération trouvée: ID ${applicablePonderation.id}`);
        }
      } else {
        console.log("Informations manquantes pour rechercher une pondération:", 
                   `Q6: ${keyResponsesAng[6] || 'manquant'}, 
                    Q8: ${keyResponsesAng[8] || 'manquant'}, 
                    Q9: ${keyResponsesAng[9] || 'manquant'}`);
      }

      // Préparer les réponses avec les scores
      const processedResponses = [];
      const categoriesMap = new Map(); // Pour calculer les scores par catégorie

      for (const response of responses) {
        const { questionId, answerId, answerText, answerTextAng } = response;
        const question = questionMap.get(questionId);
        
        if (!question) {
          console.warn(`Question ${questionId} non trouvée`);
          continue;
        }

        // Déterminer le score à attribuer
        let score = 0;
        
        // Si c'est une question à texte libre ou une réponse personnalisée
        if (question.answers.length === 0 || 
            (answerId !== undefined && 
            (question.answers[answerId] === "Autre" || question.answersAng[answerId] === "Other"))) {
          score = question.Note[answerId] || 0;
        } else {
          score = question.Note[answerId] || 0;
        }
        
        // Récupérer ou utiliser le texte de la réponse
        const finalAnswerText = answerText || question.answers[answerId] || "";
        const finalAnswerTextAng = answerTextAng || question.answersAng[answerId] || "";
        
        // Ajouter à la liste des réponses traitées
        processedResponses.push({
          questionId,
          answerId,
          answerText: finalAnswerText,
          answerTextAng: finalAnswerTextAng,
          questionText: question.question,
          questionTextAng: question.questionAng,
          score,
          category: question.category,
          categoryAng: question.categoryAng,
          categoryShort: question.category.substring(0, 2),
          categoryAngShort: question.categoryAng.substring(0, 2)
        });

        // Ne pas inclure la catégorie "basic" dans les scores
        if (question.category.toLowerCase() !== "basic") {
          // Mettre à jour les scores par catégorie
          if (!categoriesMap.has(question.category)) {
            categoriesMap.set(question.category, {
              category: question.category,
              categoryAng: question.categoryAng,
              categoryShort: question.category.substring(0, 2),
              categoryAngShort: question.categoryAng.substring(0, 2),
              score: 0,
              maxPossible: 0,
              count: 0
            });
          }
          
          const categoryData = categoriesMap.get(question.category);
          categoryData.score += score;
          
          // Trouver le score maximum possible pour cette question
          const maxPossibleScore = Math.max(...question.Note);
          categoryData.maxPossible += maxPossibleScore;
          categoryData.count += 1;
        }
      }

      // Préparer les scores par catégorie
      const categoryScoreObjs = [];
      const categoryScores = Array.from(categoriesMap.values()).map(({ category, categoryAng, categoryShort, categoryAngShort, score, maxPossible }) => {
        const percentageScore = maxPossible > 0 ? (score * 100) / maxPossible : 0;
        
        const categoryScoreObj = new CategoryScore({
          userId,
          category,
          categoryAng,
          categoryShort,
          categoryAngShort,
          score: percentageScore,
          rawScore: score,
          maxPossible
        });
        
        categoryScoreObjs.push(categoryScoreObj);
        
        return {
          category,
          categoryAng,
          categoryShort,
          categoryAngShort,
          score: percentageScore,
          rawScore: score,
          maxPossible
        };
      });

      // Calculer le score total
      const totalRawScore = categoryScores.reduce((sum, cat) => sum + cat.rawScore, 0);
      const totalMaxPossible = categoryScores.reduce((sum, cat) => sum + cat.maxPossible, 0);
      const totalPercentage = totalMaxPossible > 0 ? (totalRawScore * 100) / totalMaxPossible : 0;

      // Appliquer les pondérations si disponibles
      let kbiScores = null;
      if (applicablePonderation) {
        const profileText = `${keyResponsesAng[6]} - ${keyResponsesAng[8]} - ${keyResponsesAng[9]}`;
        
        const prScore = categoryScores.find(c => c.categoryAngShort === 'Pr')?.score || 0;
        const coScore = categoryScores.find(c => c.categoryAngShort === 'Co')?.score || 0;
        const opScore = categoryScores.find(c => c.categoryAngShort === 'Op')?.score || 0;
        const adScore = categoryScores.find(c => c.categoryAngShort === 'Ad')?.score || 0;
        const ciScore = categoryScores.find(c => c.categoryAngShort === 'Ci')?.score || 0;
        
        kbiScores = {
          profile: profileText,
          Pr: prScore * (applicablePonderation.Pr / 100),
          Co: coScore * (applicablePonderation.Co / 100),
          Op: opScore * (applicablePonderation.Op / 100),
          Ad: adScore * (applicablePonderation.Ad / 100),
          Ci: ciScore * (applicablePonderation.Ci / 100),
          KBICONSO: 0
        };
        
        kbiScores.KBICONSO = kbiScores.Pr + kbiScores.Co + kbiScores.Op + kbiScores.Ad + kbiScores.Ci;
      }

      // Créer l'objet de réponse utilisateur avec la structure originale
      const userResponseObj = new UserResponse({
        userId,
        responses: processedResponses
      });

      // Créer le modèle TotalScore
      const totalScoreObj = new TotalScore({
        userId,
        score: totalPercentage,
        rawScore: totalRawScore,
        maxPossible: totalMaxPossible,
        kbiScores
      });

      // Créer le modèle KeyResponse
      const keyResponseObj = new KeyResponse({
        userId,
        industry: keyResponses[6],
        industryAng: keyResponsesAng[6],
        organizationType: keyResponses[8],
        organizationTypeAng: keyResponsesAng[8],
        changePhase: keyResponses[9],
        changePhaseAng: keyResponsesAng[9]
      });

      // Sauvegarder les données dans les modèles séparés
      await UserResponse.deleteOne({ userId }, { session });
      await CategoryScore.deleteMany({ userId }, { session });
      await TotalScore.deleteOne({ userId }, { session });
      await KeyResponse.deleteOne({ userId }, { session });
      
      // Sauvegarder les nouveaux documents
      await userResponseObj.save({ session });
      await Promise.all(categoryScoreObjs.map(cat => cat.save({ session })));
      await totalScoreObj.save({ session });
      await keyResponseObj.save({ session });
      
      // Valider la transaction
      await session.commitTransaction();
      
      res.status(201).json({
        message: 'Réponses enregistrées avec succès',
        data: {
          userId,
          categoryScores,
          totalScore: {
            score: totalPercentage,
            rawScore: totalRawScore,
            maxPossible: totalMaxPossible
          },
          kbiScores,
          keyResponses: {
            industry: keyResponses[6],
            industryAng: keyResponsesAng[6],
            organizationType: keyResponses[8],
            organizationTypeAng: keyResponsesAng[8],
            changePhase: keyResponses[9],
            changePhaseAng: keyResponsesAng[9]
          },
          ponderationFound: !!applicablePonderation,
          ponderationId: applicablePonderation?.id || null
        }
      });
    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await session.abortTransaction();
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
      // Terminer la session
      session.endSession();
    }
  },

  // Récupérer les résultats d'un utilisateur
  getUserResults: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Récupérer toutes les données depuis les différents modèles
      const userResponse = await UserResponse.findOne({ userId });
      const categoryScores = await CategoryScore.find({ userId });
      const totalScore = await TotalScore.findOne({ userId });
      const keyResponse = await KeyResponse.findOne({ userId });
      
      if (!userResponse || !categoryScores.length || !totalScore || !keyResponse) {
        return res.status(404).json({ message: 'Aucun résultat trouvé pour cet utilisateur' });
      }
      
      res.json({
        userId,
        responses: userResponse.responses,
        categoryScores,
        totalScore,
        keyResponses: keyResponse,
        createdAt: totalScore.createdAt
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Récupérer uniquement les réponses d'un utilisateur
  getUserResponses: async (req, res) => {
    try {
      const { userId } = req.params;
      const userResponse = await UserResponse.findOne({ userId });
      
      if (!userResponse) {
        return res.status(404).json({ message: 'Aucune réponse trouvée pour cet utilisateur' });
      }
      
      res.json({ userId, responses: userResponse.responses });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Récupérer uniquement les scores par catégorie d'un utilisateur
  getUserCategoryScores: async (req, res) => {
    try {
      const { userId } = req.params;
      const categoryScores = await CategoryScore.find({ userId });
      
      if (!categoryScores.length) {
        return res.status(404).json({ message: 'Aucun score par catégorie trouvé pour cet utilisateur' });
      }
      
      res.json({ userId, categoryScores });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Récupérer uniquement le score total d'un utilisateur
  getUserTotalScore: async (req, res) => {
    try {
      const { userId } = req.params;
      const totalScore = await TotalScore.findOne({ userId });
      
      if (!totalScore) {
        return res.status(404).json({ message: 'Aucun score total trouvé pour cet utilisateur' });
      }
      
      res.json({ userId, totalScore });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Récupérer uniquement les réponses clés d'un utilisateur
  getUserKeyResponses: async (req, res) => {
    try {
      const { userId } = req.params;
      const keyResponses = await KeyResponse.findOne({ userId });
      
      if (!keyResponses) {
        return res.status(404).json({ message: 'Aucune réponse clé trouvée pour cet utilisateur' });
      }
      
      res.json({ userId, keyResponses });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
};

module.exports = userResponseController;