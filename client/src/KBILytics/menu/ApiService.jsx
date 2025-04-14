<<<<<<< HEAD

import api from "../../api";

const getUserId = () => {
  let userId = localStorage.getItem('kbi_user_id');
  
=======
import api from "../../api";

// Générer un ID utilisateur unique basé sur l'appareil/navigateur
const getUserId = () => {
  // Vérifier si un userId existe déjà en localStorage
  let userId = localStorage.getItem('kbi_user_id');
  
  // Si non, en créer un nouveau
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('kbi_user_id', userId);
  }
  
  return userId;
};

<<<<<<< HEAD
let questionsCache = {};

const ApiService = {
=======
// Cache pour stocker les questions et leurs réponses
let questionsCache = {};

const ApiService = {
  // Fonction pour charger toutes les questions
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
  getAllQuestions: async () => {
    try {
      const response = await api.get('/questions');
      
<<<<<<< HEAD
=======
      // Mettre en cache toutes les questions
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les questions:', error);
      throw error;
    }
  },

<<<<<<< HEAD
=======
  // Fonction pour charger les questions par catégorie
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
  getQuestionsByCategory: async (category) => {
    try {
      const response = await api.get(`/questions/category/${encodeURIComponent(category)}`);
      
<<<<<<< HEAD
=======
      // Mettre en cache les questions de cette catégorie
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des questions par catégorie:', error);
      throw error;
    }
  },

<<<<<<< HEAD
  submitAllAnswers: async (allResponses) => {
    try {
      const userId = getUserId();
      
      // Préparer les réponses pour l'API
      const formattedResponses = allResponses.map(response => {
        const question = questionsCache[response.questionId];
        
        let answerId;
        let answerText = response.answerValue;
        let answerTextAng = response.answerValue;
        
        // Si c'est une réponse "Autre" avec texte spécifié
        if ((response.answerValue === "Autre" || response.answerValue === "Other") && response.otherValue) {
          answerText = response.otherValue;
          answerTextAng = response.otherValue;
        }
        
        // Pour les questions à texte libre
        if (!question || !question.answers || question.answers.length === 0) {
          answerId = 0;
        } else {
          // Trouver l'index de la réponse
          answerId = question.answers.findIndex(a => a === response.answerValue);
          
          // Si l'index n'est pas trouvé, vérifier dans les réponses en anglais
          if (answerId === -1 && question.answersAng) {
            answerId = question.answersAng.findIndex(a => a === response.answerValue);
=======
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
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
          }
          
          // Si toujours pas trouvé, utiliser 0 comme valeur par défaut
          if (answerId === -1) {
<<<<<<< HEAD
            console.warn(`Réponse "${response.answerValue}" introuvable pour la question ${response.questionId}`);
            answerId = 0;
          }
        }
        
        return {
          questionId: response.questionId,
          answerId,
          answerText,
          answerTextAng,
          category: response.category
        };
=======
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
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
      });
      
      const payload = {
        userId,
<<<<<<< HEAD
        responses: formattedResponses
      };
      
      console.log('Submitting all answers to API:', payload);
=======
        responses
      };
      
      console.log('Submitting to API:', payload);
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
      
      const response = await api.post('/responses', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses:', error);
      throw error;
    }
  },
  
<<<<<<< HEAD
=======
  // Fonction pour récupérer les résultats d'un utilisateur
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
  getUserResults: async () => {
    try {
      const userId = getUserId();
      const response = await api.get(`/responses/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      throw error;
    }
  }
};

export default ApiService;