// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getUserId = () => {
  let userId = localStorage.getItem('kbi_user_id');

  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('kbi_user_id', userId);
  }

  return userId;
};

let questionsCache = {};
let categoriesCache = null;

const ApiService = {
  getAllQuestions: async () => {
    try {
      const response = await api.get('/questions');

      if (Array.isArray(response.data)) {
        response.data.forEach(q => {
          questionsCache[q.id] = q;
        });
        return response.data;
      } else {
        console.warn("getAllQuestions: Réponse inattendue", response.data);
        return [];
      }

    } catch (error) {
      console.error('Erreur lors du chargement de toutes les questions:', error);
      throw error;
    }
  },

  // Récupérer toutes les catégories disponibles
  getAllCategories: async (lang = 'fr') => {
    try {
      if (categoriesCache) {
        return categoriesCache;
      }

      const response = await api.get(`/categories?lang=${lang}`);
      
      // Analyser la réponse pour identifier le format
      let categories = [];
      
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        categories = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si la réponse contient des catégories directement
        const possibleCategories = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && (item._id || item.id)
        );
        
        if (possibleCategories.length > 0) {
          categories = possibleCategories;
        }
      }
      
      // Mettre à jour le cache
      categoriesCache = categories;
      return categories;
      
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      throw error;
    }
  },

  getQuestionsByCategory: async (category) => {
    try {
      // Vérifier si la catégorie est valide
      if (!category) {
        console.error("Catégorie non spécifiée");
        return [];
      }

      // Essayer d'abord de récupérer depuis l'API
      const response = await api.get(`/questions/category/${encodeURIComponent(category)}`);
  
      // Analyser la réponse pour identifier le format
      let questions = [];
      
      if (Array.isArray(response.data)) {
        questions = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        questions = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si la réponse contient des questions directement
        const possibleQuestions = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && item.id && item.question
        );
        
        if (possibleQuestions.length > 0) {
          questions = possibleQuestions;
        }
      }

      // Si aucune question trouvée via l'API pour cette catégorie, essayer de filtrer localement
      if (questions.length === 0) {
        console.warn(`Aucune question trouvée via l'API pour la catégorie: ${category}, essai de filtrage local`);
        
        // Récupérer toutes les questions si ce n'est pas déjà fait
        const allQuestions = Object.values(questionsCache).length > 0 ? 
                            Object.values(questionsCache) : 
                            await ApiService.getAllQuestions();
        
        // Filtrer les questions par catégorie
        questions = allQuestions.filter(q => q.category === category);
        
        if (questions.length === 0) {
          console.warn(`Aucune question trouvée pour la catégorie: ${category} même après filtrage local`);
        }
      }

      // Mettre à jour le cache avec les questions trouvées
      questions.forEach(q => {
        questionsCache[q.id] = q;
      });
  
      return questions;
  
    } catch (error) {
      console.error(`Erreur lors du chargement des questions pour la catégorie '${category}':`, error);
      
      // Tentative de récupération des questions depuis le cache ou en filtrant toutes les questions
      try {
        const allQuestions = Object.values(questionsCache).length > 0 ? 
                            Object.values(questionsCache) : 
                            await ApiService.getAllQuestions();
        
        const filteredQuestions = allQuestions.filter(q => q.category === category);
        
        if (filteredQuestions.length > 0) {
          console.info(`Récupération de secours: ${filteredQuestions.length} questions trouvées pour la catégorie '${category}'`);
          return filteredQuestions;
        }
      } catch (backupError) {
        console.error('Échec de la récupération de secours:', backupError);
      }
      
      return [];
    }
  },
  
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie ID: ${categoryId}:`, error);
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