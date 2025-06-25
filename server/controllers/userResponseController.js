const UserResponse = require('../models/UserResponse');
const KeyResponse = require('../models/KeyResponse');
const Question = require('../models/Question');
const Ponderation = require('../models/Ponderation');
const mongoose = require('mongoose');

const userResponseController = {
  // Enregistrer les réponses d'un utilisateur
  saveUserResponses: async (req, res) => {
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
        
        // CORRECTION: Toujours récupérer la version française ET anglaise depuis la base de données
      finalAnswerText = '';
finalAnswerTextAng = '';

        
        // Si c'est une réponse personnalisée (Autre/Other)
        if (answerId !== undefined && 
            (question.answers[answerId] === "Autre" || question.answersAng[answerId] === "Other")) {
          // Utiliser le texte personnalisé fourni
          finalAnswerText = answerText || question.answers[answerId] || "";
          finalAnswerTextAng = answerTextAng || answerText || ""; // Si pas d'anglais fourni, utiliser le français
        } else {
          // Utiliser les réponses prédéfinies de la base de données
          finalAnswerText = question.answers[answerId] || answerText || "";
          finalAnswerTextAng = question.answersAng[answerId] || answerTextAng || "";
        }
        
        // Ajouter à la liste des réponses traitées
        processedResponses.push({
          questionId,
          answerId,
          answerText: finalAnswerText,
          answerTextAng: finalAnswerTextAng, // Maintenant correctement en anglais
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
      const categoryScores = Array.from(categoriesMap.values()).map(({ category, categoryAng, categoryShort, categoryAngShort, score, maxPossible }) => {
        const percentageScore = maxPossible > 0 ? (score * 100) / maxPossible : 0;
        
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

      // Préparer les données pour UserResponse avec les KBI scores
      let profileText = '';
      let prScore = 0;
      let coScore = 0;
      let opScore = 0;
      let adScore = 0;
      let ciScore = 0;
      let kbiConsScore = 0;

      // Appliquer les pondérations si disponibles
      if (applicablePonderation) {
        profileText = `${keyResponsesAng[6]} - ${keyResponsesAng[8]} - ${keyResponsesAng[9]}`;
        
        prScore = categoryScores.find(c => c.categoryAngShort === 'Pr')?.score || 0;
        coScore = categoryScores.find(c => c.categoryAngShort === 'Co')?.score || 0;
        opScore = categoryScores.find(c => c.categoryAngShort === 'Op')?.score || 0;
        adScore = categoryScores.find(c => c.categoryAngShort === 'Ad')?.score || 0;
        ciScore = categoryScores.find(c => c.categoryAngShort === 'Ci')?.score || 0;
        
        const weightedPr = prScore * (applicablePonderation.Pr / 100);
        const weightedCo = coScore * (applicablePonderation.Co / 100);
        const weightedOp = opScore * (applicablePonderation.Op / 100);
        const weightedAd = adScore * (applicablePonderation.Ad / 100);
        const weightedCi = ciScore * (applicablePonderation.Ci / 100);
        
        kbiConsScore = weightedPr + weightedCo + weightedOp + weightedAd + weightedCi;
        
        // Mettre à jour les scores pondérés
        prScore = weightedPr;
        coScore = weightedCo;
        opScore = weightedOp;
        adScore = weightedAd;
        ciScore = weightedCi;
      }

      // Supprimer les anciennes données
      await UserResponse.deleteOne({ userId });
      await KeyResponse.deleteOne({ userId });

      // Créer l'objet de réponse utilisateur avec la structure mise à jour
      const userResponseObj = new UserResponse({
        userId,
        responses: processedResponses,
        categoryScores: categoryScores, // Stockage direct des scores par catégorie
        score: totalPercentage,
        rawScore: totalRawScore,
        maxPossible: totalMaxPossible,
        profile: profileText,
        Pr: prScore,
        Co: coScore,
        Op: opScore,
        Ad: adScore,
        Ci: ciScore,
        KBICONSO: kbiConsScore
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

      // Sauvegarder les nouveaux documents
      await userResponseObj.save();
      await keyResponseObj.save();
      
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
          kbiScores: {
            profile: profileText,
            Pr: prScore,
            Co: coScore,
            Op: opScore,
            Ad: adScore,
            Ci: ciScore,
            KBICONSO: kbiConsScore
          },
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
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },

  // Récupérer les résultats d'un utilisateur
  getUserResults: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Récupérer les données depuis le modèle UserResponse
      const userResponse = await UserResponse.findOne({ userId });
      const keyResponse = await KeyResponse.findOne({ userId });
      
      if (!userResponse || !keyResponse) {
        return res.status(404).json({ message: 'Aucun résultat trouvé pour cet utilisateur' });
      }
      
      res.json({
        userId,
        responses: userResponse.responses,
        categoryScores: userResponse.categoryScores,
        totalScore: {
          score: userResponse.score,
          rawScore: userResponse.rawScore,
          maxPossible: userResponse.maxPossible
        },
        kbiScores: {
          profile: userResponse.profile,
          Pr: userResponse.Pr,
          Co: userResponse.Co,
          Op: userResponse.Op,
          Ad: userResponse.Ad,
          Ci: userResponse.Ci,
          KBICONSO: userResponse.KBICONSO
        },
        keyResponses: keyResponse,
        createdAt: userResponse.createdAt
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Dans controllers/userResponseController.js
  saveImportedResponses: async (req, res) => {
    try {
      const { importedData } = req.body;

      if (!Array.isArray(importedData)) {
        return res.status(400).json({ message: 'Données importées invalides' });
      }

      // Utiliser bulkWrite pour optimiser les performances
      const bulkOps = importedData.map(data => ({
        updateOne: {
          filter: { userId: data.userId },
          update: { $setOnInsert: data },
          upsert: true
        }
      }));

      const result = await UserResponse.bulkWrite(bulkOps);

      res.status(201).json({
        message: 'Import terminé',
        inserted: result.upsertedCount,
        modified: result.modifiedCount,
        total: importedData.length
      });
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'import',
        error: error.message 
      });
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
      const userResponse = await UserResponse.findOne({ userId });
      
      if (!userResponse || !userResponse.categoryScores.length) {
        return res.status(404).json({ message: 'Aucun score par catégorie trouvé pour cet utilisateur' });
      }
      
      res.json({ userId, categoryScores: userResponse.categoryScores });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
  // Récupérer uniquement le score total d'un utilisateur
  getUserTotalScore: async (req, res) => {
    try {
      const { userId } = req.params;
      const userResponse = await UserResponse.findOne({ userId });
      
      if (!userResponse) {
        return res.status(404).json({ message: 'Aucun score total trouvé pour cet utilisateur' });
      }
      
      res.json({ 
        userId, 
        totalScore: {
          score: userResponse.score,
          rawScore: userResponse.rawScore,
          maxPossible: userResponse.maxPossible,
          kbiScores: {
            profile: userResponse.profile,
            Pr: userResponse.Pr,
            Co: userResponse.Co,
            Op: userResponse.Op,
            Ad: userResponse.Ad,
            Ci: userResponse.Ci,
            KBICONSO: userResponse.KBICONSO
          }
        }
      });
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