import axios from 'axios';
import api from "../api"
// URL de base de l'API - à ajuster selon votre environnement
const API_BASE_URL = 'http://localhost:3000/api';

// Générer un ID utilisateur unique basé sur l'appareil/navigateur
const getUserId = () => {
  // Vérifier si un userId existe déjà en localStorage
  let userId = localStorage.getItem('kbi_user_id');
  
  // Si non, en créer un nouveau
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('kbi_user_id', userId);
  }
  
  return userId;
};

// Cache pour stocker les questions et leurs réponses
let questionsCache = {};

const ApiService = {
  // Fonction pour charger toutes les questions
  getAllQuestions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`);
      
      // Mettre en cache toutes les questions
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les questions:', error);
      throw error;
    }
  },

  // Fonction pour charger les questions par catégorie
  getQuestionsByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/category/${encodeURIComponent(category)}`);
      
      // Mettre en cache les questions de cette catégorie
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des questions par catégorie:', error);
      throw error;
    }
  },

  // Fonction pour soumettre les réponses
  submitAnswers: async (answersObj, otherAnswers) => {
    try {
      // S'assurer que toutes les questions sont en cache
      if (Object.keys(questionsCache).length === 0) {
        await ApiService.getAllQuestions();
      }
      
      const userId = getUserId();
      
      // Convertir l'objet de réponses en tableau de réponses
      const responses = Object.entries(answersObj).map(([questionId, answerValue]) => {
        const question = questionsCache[questionId];
        
        if (!question) {
          console.warn(`Question ${questionId} introuvable dans le cache`);
          return { 
            questionId: parseInt(questionId), 
            answerId: 0,
            answerText: answerValue // Stocker le texte de la réponse même si la question n'est pas trouvée
          };
        }
        
        let answerId;
        let finalAnswerText = answerValue;
        
        // Vérifier si c'est une réponse "Autre" et qu'une valeur a été saisie
        if ((answerValue === "Autre" || answerValue === "Other") && otherAnswers && otherAnswers[questionId]) {
          finalAnswerText = otherAnswers[questionId]; // Utiliser la valeur saisie par l'utilisateur
        }
        
        // Pour les questions à texte libre
        if (question.answers.length === 0) {
          answerId = 0;
          return {
            questionId: parseInt(questionId),
            answerId,
            answerText: finalAnswerText, // Le texte saisi par l'utilisateur
            answerTextAng: finalAnswerText // Même valeur pour la version anglaise
          };
        } else {
          // Pour les questions à choix multiples, trouver l'index de la réponse
          answerId = question.answers.findIndex(a => a === answerValue);
          
          // Si l'index n'est pas trouvé, vérifier dans les réponses en anglais
          if (answerId === -1 && question.answersAng) {
            answerId = question.answersAng.findIndex(a => a === answerValue);
          }
          
          // Si c'est "Autre" ou "Other", on garde l'index mais on utilise le texte personnalisé
          if ((answerValue === "Autre" || answerValue === "Other") && otherAnswers && otherAnswers[questionId]) {
            return {
              questionId: parseInt(questionId),
              answerId,
              answerText: otherAnswers[questionId], // Texte personnalisé saisi par l'utilisateur
              answerTextAng: otherAnswers[questionId] // Même valeur pour l'anglais
            };
          }
          
          // Si toujours pas trouvé, utiliser 0 comme valeur par défaut
          if (answerId === -1) {
            console.warn(`Réponse "${answerValue}" introuvable pour la question ${questionId}`);
            answerId = 0;
          }
          
          // Déterminer la version française et anglaise du texte de la réponse
          const answerText = question.answers[answerId] || finalAnswerText;
          const answerTextAng = (question.answersAng && question.answersAng[answerId]) || finalAnswerText;
          
          return {
            questionId: parseInt(questionId),
            answerId,
            answerText,
            answerTextAng
          };
        }
      });
      
      const payload = {
        userId,
        responses
      };
      
      console.log('Submitting to API:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/responses`, payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses:', error);
      throw error;
    }
  },
  
  // Fonction pour récupérer les résultats d'un utilisateur
  getUserResults: async () => {
    try {
      const userId = getUserId();
      const response = await axios.get(`${API_BASE_URL}/responses/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      throw error;
    }
  }
};

export default ApiService;