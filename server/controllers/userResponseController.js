const UserResponse = require('../models/UserResponse');
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
      
      // Log pour vérifier que les pondérations sont bien chargées
      console.log(`Nombre de pondérations trouvées: ${allPonderations.length}`);
      
      if (allPonderations.length === 0) {
        console.warn("ATTENTION: Aucune pondération n'a été trouvée dans la base de données!");
      }

      // Extraire les réponses spécifiques (6, 8, 9) - EN ANGLAIS pour la comparaison
      const keyResponses = {};
      const keyResponsesAng = {}; // Version anglaise des réponses
      
      for (const response of responses) {
        if ([6, 8, 9].includes(response.questionId)) {
          const question = questionMap.get(response.questionId);
          if (question) {
            // Stocker la version française
            const answerText = question.answers[response.answerId] || response.answerText;
            keyResponses[response.questionId] = answerText;
            
            // Stocker la version anglaise pour la comparaison avec la table de pondération
            const answerTextAng = question.answersAng[response.answerId] || response.answerTextAng;
            keyResponsesAng[response.questionId] = answerTextAng;
            
            // Log pour vérifier les valeurs extraites
            console.log(`Question ${response.questionId} (EN): ${answerTextAng}`);
          }
        }
      }

      // Trouver la pondération applicable si tous les champs nécessaires sont présents
      let applicablePonderation = null;
      if (keyResponsesAng[6] && keyResponsesAng[8] && keyResponsesAng[9]) {
        const industry = keyResponsesAng[6].trim();
        const orgType = keyResponsesAng[8].trim();
        const changePhase = keyResponsesAng[9].trim();
        
        console.log("Recherche de pondération pour:", JSON.stringify([industry, orgType, changePhase]));
        
        // Vérifier si les valeurs existent dans les pondérations
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
        
        // Si aucune correspondance exacte, essayer en ignorant la casse
        if (!applicablePonderation) {
          console.log("Aucune correspondance exacte, essai avec recherche insensible à la casse...");
          applicablePonderation = allPonderations.find(p => 
            p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
            p.possibilite[0].toLowerCase() === industry.toLowerCase() && 
            p.possibilite[1].toLowerCase() === orgType.toLowerCase() && 
            p.possibilite[2].toLowerCase() === changePhase.toLowerCase()
          );
        }
        
        // Si toujours aucune correspondance, afficher des infos de débogage détaillées
        if (!applicablePonderation) {
          console.log("AUCUNE PONDÉRATION TROUVÉE! Voici les détails pour le débogage:");
          
          // Afficher toutes les combinaisons de pondération disponibles
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
          // Pour les réponses de type "Autre", on attribue un score par défaut
          score = question.Note[answerId] || 0;
        } else {
          // Récupérer la note correspondante à la réponse
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
          // Ajouter les abréviations des catégories
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
              categoryShort: question.category.substring(0, 2),     // Abréviation FR
              categoryAngShort: question.categoryAng.substring(0, 2), // Abréviation EN
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

      // Préparer les scores par catégorie avec la nouvelle formule: (score * 100) / maxPossible
      const categoryScores = Array.from(categoriesMap.values()).map(({ category, categoryAng, categoryShort, categoryAngShort, score, maxPossible }) => {
        // Calculer le pourcentage: (score * 100) / maxPossible
        const percentageScore = maxPossible > 0 ? (score * 100) / maxPossible : 0;
        
        return {
          category,
          categoryAng,
          categoryShort,     // Abréviation FR
          categoryAngShort,  // Abréviation EN
          score: percentageScore, // Remplacer le score par le pourcentage
          rawScore: score, // Conserver le score brut pour référence
          maxPossible
        };
      });

      // Calculer le score total également en pourcentage
      const totalRawScore = categoryScores.reduce((sum, cat) => sum + cat.rawScore, 0);
      const totalMaxPossible = categoryScores.reduce((sum, cat) => sum + cat.maxPossible, 0);
      const totalPercentage = totalMaxPossible > 0 ? (totalRawScore * 100) / totalMaxPossible : 0;

      const totalScore = {
        score: totalPercentage, // Score total en pourcentage
        rawScore: totalRawScore, // Score brut pour référence
        maxPossible: totalMaxPossible
      };

      // Appliquer les pondérations si disponibles
      let kbiScores = null;
      if (applicablePonderation) {
        // Créer le profil en utilisant les versions anglaises pour la cohérence
        const profileText = `${keyResponsesAng[6]} - ${keyResponsesAng[8]} - ${keyResponsesAng[9]}`;
        
        // Rechercher les scores des catégories par leurs abréviations en anglais
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
        
        // Calculer le score total KBI
        kbiScores.KBICONSO = kbiScores.Pr + kbiScores.Co + kbiScores.Op + kbiScores.Ad + kbiScores.Ci;
      }

      // Créer l'objet de réponse utilisateur
      const userResponse = new UserResponse({
        userId,
        responses: processedResponses,
        categoryScores,
        totalScore,
        kbiScores,
        keyResponses: {
          industry: keyResponses[6],
          industryAng: keyResponsesAng[6],
          organizationType: keyResponses[8],
          organizationTypeAng: keyResponsesAng[8],
          changePhase: keyResponses[9],
          changePhaseAng: keyResponsesAng[9]
        }
      });

      await userResponse.save();
      
      res.status(201).json({
        message: 'Réponses enregistrées avec succès',
        data: {
          userId,
          categoryScores,
          totalScore,
          kbiScores,
          keyResponses: userResponse.keyResponses,
          ponderationFound: !!applicablePonderation, // Indiquer si une pondération a été trouvée
          ponderationId: applicablePonderation?.id || null // ID de la pondération si trouvée
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
      
      const userResponse = await UserResponse.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!userResponse) {
        return res.status(404).json({ message: 'Aucun résultat trouvé pour cet utilisateur' });
      }
      
      res.json({
        userId: userResponse.userId,
        responses: userResponse.responses,
        categoryScores: userResponse.categoryScores,
        totalScore: userResponse.totalScore,
        kbiScores: userResponse.kbiScores,
        keyResponses: userResponse.keyResponses,
        createdAt: userResponse.createdAt
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
};

module.exports = userResponseController;