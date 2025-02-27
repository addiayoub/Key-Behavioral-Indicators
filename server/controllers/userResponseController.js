const UserResponse = require('../models/UserResponse');
const Question = require('../models/Question');
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
          // Vous pouvez ajuster cette logique selon vos besoins
          score = question.Note[answerId] || 0;
        } else {
          // Récupérer la note correspondante à la réponse
          score = question.Note[answerId] || 0;
        }
        
        // Récupérer ou utiliser le texte de la réponse
        // Si c'est une réponse "Autre", utiliser le texte personnalisé fourni
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
          categoryAng: question.categoryAng
        });

        // Mettre à jour les scores par catégorie
        if (!categoriesMap.has(question.category)) {
          categoriesMap.set(question.category, {
            category: question.category,
            categoryAng: question.categoryAng,
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

      // Préparer les scores par catégorie
      const categoryScores = Array.from(categoriesMap.values()).map(({ category, categoryAng, score, maxPossible }) => ({
        category,
        categoryAng,
        score,
        maxPossible
      }));

      // Calculer le score total
      const totalScore = {
        score: categoryScores.reduce((sum, cat) => sum + cat.score, 0),
        maxPossible: categoryScores.reduce((sum, cat) => sum + cat.maxPossible, 0)
      };

      // Créer l'objet de réponse utilisateur
      const userResponse = new UserResponse({
        userId,
        responses: processedResponses,
        categoryScores,
        totalScore,
      });

      await userResponse.save();
      
      res.status(201).json({
        message: 'Réponses enregistrées avec succès',
        data: {
          userId,
          categoryScores,
          totalScore
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
        createdAt: userResponse.createdAt
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
};

module.exports = userResponseController;