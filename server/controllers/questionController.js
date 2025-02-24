// questionController.js
const Question = require('../models/Question');

const questionController = {
  getQuestionsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      console.log('Recherche de la catégorie:', category);
      
      const questions = await Question.find({ category });
      console.log('Questions trouvées:', questions);
      
      if (questions.length === 0) {
        return res.status(404).json({ message: 'Aucune question trouvée pour cette catégorie' });
      }
      
      res.json(questions);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
};

module.exports = questionController;