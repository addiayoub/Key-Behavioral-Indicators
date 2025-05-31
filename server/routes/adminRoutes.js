const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const uploadLogo = require('../config/upload');
const Ponderation = require('../models/Ponderation');

// Import category controller
const {
  getAllCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  uploadIcon,
  updateOrdre
} = require('../controllers/categorieController');

// Middleware d'authentification pour toutes les routes admin
router.use(authController.protect, authController.restrictTo('admin'));

// Route pour les statistiques du dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);

// Routes clients
router.get('/clients', adminController.getAllClients);
router.post('/clients', adminController.createClient);
router.put('/clients/:id', adminController.updateClient);
router.get('/clients/:clientId/employees', adminController.getClientEmployees);
router.get('/clients/:clientId/responses', adminController.getClientResponses);

// Routes pour upload de logo
router.post('/clients/upload-logo', uploadLogo.single('logo'), adminController.uploadClientLogo);
router.post('/clients/:clientId/upload-logo', uploadLogo.single('logo'), adminController.uploadClientLogo);
router.delete('/clients/logo/:filename', adminController.deleteClientLogo);

// Routes réponses
router.get('/responses', adminController.getAllResponses);
router.get('/responses/:userId', adminController.getUserResponses);

// Routes admin
router.post('/create-admin', adminController.createAdmin);

// Routes questions
router.get('/questions', adminController.getAllQuestions);
router.get('/questions/category/:category', adminController.getQuestionsByCategory);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Routes catégories - FIXED ORDER AND REMOVED CONFLICT
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategorieById);
router.post('/categories', uploadLogo.single('icon'), createCategorie);
router.put('/categories/:id', uploadLogo.single('icon'), updateCategorie);
router.delete('/categories/:id', deleteCategorie);
router.post('/categories/:id/icon', uploadLogo.single('icon'), uploadIcon);
router.patch('/categories/:id/ordre', updateOrdre); // This is the correct route for order updates

// Routes pondérations
router.get('/ponderations', async (req, res) => {
  try {
    const ponderations = await Ponderation.find();
    res.json(ponderations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/ponderations/:id', adminController.updatePonderation);

module.exports = router;