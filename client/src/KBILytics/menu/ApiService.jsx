

// src/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getUserId = () => {
  let userId = localStorage.getItem('kbi_user_id');
  
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('kbi_user_id', userId);
  }
  
  return userId;
};

let questionsCache = {};

const ApiService = {
  getAllQuestions: async () => {
    try {
      const response = await api.get('/questions');
      
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les questions:', error);
      throw error;
    }
  },

  getQuestionsByCategory: async (category) => {
    try {
      const response = await api.get(`/questions/category/${encodeURIComponent(category)}`);
      
      response.data.forEach(q => {
        questionsCache[q.id] = q;
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des questions par catégorie:', error);
      throw error;
    }
  },

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
          }
          
          // Si toujours pas trouvé, utiliser 0 comme valeur par défaut
          if (answerId === -1) {
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
      });
      
      const payload = {
        userId,
        responses: formattedResponses
      };
      
      console.log('Submitting all answers to API:', payload);
      
      const response = await api.post('/responses', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses:', error);
      throw error;
    }
  },
  
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