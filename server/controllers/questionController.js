const Question = require('../models/Question');

const questionController = {
  // Récupérer toutes les questions
  getAllQuestions: async (req, res) => {
    try {
      const questions = await Question.find();
      res.json(questions);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },

  // Récupérer les questions par catégorie
  getQuestionsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      console.log('Recherche de la catégorie:', category);
      
      const questions = await Question.find({ 
        $or: [{ category }, { categoryAng: category }] 
      });
      
      console.log('Questions trouvées:', questions);
      
      if (questions.length === 0) {
        return res.status(404).json({ message: 'Aucune question trouvée pour cette catégorie' });
      }
      
      res.json(questions);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },

  // Créer une nouvelle question
  createQuestion: async (req, res) => {
    try {
      const { id, question, questionAng, required, answers, answersAng, Note, category, categoryAng } = req.body;
      
      const newQuestion = new Question({
        _id: new mongoose.Types.ObjectId(),
        id,
        question,
        questionAng,
        required,
        answers,
        answersAng,
        Note,
        category,
        categoryAng
      });
      
      await newQuestion.save();
      res.status(201).json(newQuestion);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
};

module.exports = questionController;