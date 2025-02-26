// apiService.js
import axios from 'axios';

const ApiService = {
  // Fonction pour charger les questions par catégorie
  getQuestionsByCategory: async (category) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/questions/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      throw error;
    }
  },

  // Fonction pour soumettre les réponses
  submitAnswers: async (answers) => {
    try {
      console.log('Submitting answers:', answers);
      // Vous pouvez remplacer ce console.log par un vrai appel API
      // const response = await axios.post('http://localhost:3000/api/submit-answers', { answers });
      // return response.data;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses:', error);
      throw error;
    }
  }
};

export default ApiService;