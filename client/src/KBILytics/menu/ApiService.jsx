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

  getAllCategories: async (lang = 'fr') => {
    try {
      if (categoriesCache) {
        return categoriesCache;
      }
      const response = await api.get(`/categories?lang=${lang}`);
      let categories = [];
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        categories = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleCategories = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && (item._id || item.id)
        );
        if (possibleCategories.length > 0) {
          categories = possibleCategories;
        }
      }
      categoriesCache = categories;
      return categories;
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      throw error;
    }
  },

  getQuestionsByCategory: async (category) => {
    try {
      if (!category) {
        console.error("Catégorie non spécifiée");
        return [];
      }
      const response = await api.get(`/questions/category/${encodeURIComponent(category)}`);
      let questions = [];
      if (Array.isArray(response.data)) {
        questions = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        questions = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleQuestions = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && item.id && item.question
        );
        if (possibleQuestions.length > 0) {
          questions = possibleQuestions;
        }
      }
      if (questions.length === 0) {
        console.warn(`Aucune question trouvée via l'API pour la catégorie: ${category}, essai de filtrage local`);
        const allQuestions = Object.values(questionsCache).length > 0 ? 
                            Object.values(questionsCache) : 
                            await ApiService.getAllQuestions();
        questions = allQuestions.filter(q => q.category === category);
        if (questions.length === 0) {
          console.warn(`Aucune question trouvée pour la catégorie: ${category} même après filtrage local`);
        }
      }
      questions.forEach(q => {
        questionsCache[q.id] = q;
      });
      return questions;
    } catch (error) {
      console.error(`Erreur lors du chargement des questions pour la catégorie '${category}':`, error);
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

  employeeLogin: async (credentials) => {
    try {
      const response = await api.post('/auth/employee/login', {
        username: credentials.login,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion employé:', error);
      throw error;
    }
  },

  submitAllAnswers: async (allResponses) => {
    try {
      const userId = getUserId();
      const formattedResponses = allResponses.map(response => {
        const question = questionsCache[response.questionId];
        let answerId;
        let answerText = response.answerValue;
        let answerTextAng = response.answerValue;
        if ((response.answerValue === "Autre" || response.answerValue === "Other") && response.otherValue) {
          answerText = response.otherValue;
          answerTextAng = response.otherValue;
        }
        if (!question || !question.answers || question.answers.length === 0) {
          answerId = 0;
        } else {
          answerId = question.answers.findIndex(a => a === response.answerValue);
          if (answerId === -1 && question.answersAng) {
            answerId = question.answersAng.findIndex(a => a === response.answerValue);
          }
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
  // Dans ApiService.js
getClientInfo: async (clientId) => {
  try {
    const response = await api.get(`/client/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos client:', error);
    throw error;
  }
},

  submitEmployeeAnswers: async ({ clientId, sessionId, employeeName, employeeEmail, responses, token, completionTime }) => {
    try {
      const formattedResponses = responses.map(response => {
        const question = questionsCache[response.questionId];
        let answerId;
        let answerText = response.answerValue;
        let answerTextAng = response.answerValue;
        if ((response.answerValue === "Autre" || response.answerValue === "Other") && response.otherValue) {
          answerText = response.otherValue;
          answerTextAng = response.otherValue;
        }
        if (!question || !question.answers || question.answers.length === 0) {
          answerId = 0;
        } else {
          answerId = question.answers.findIndex(a => a === response.answerValue);
          if (answerId === -1 && question.answersAng) {
            answerId = question.answersAng.findIndex(a => a === response.answerValue);
          }
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
        clientId,
        sessionId,
        employeeName,
        employeeEmail,
        responses: formattedResponses,
        metadata: {
          completionTime
        }
      };
      console.log('Submitting employee answers to API:', payload);
      const response = await api.post('/employee/responses', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses employé:', error);
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