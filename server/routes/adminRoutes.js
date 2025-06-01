const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const uploadLogo = require('../config/upload');
const Ponderation = require('../models/Ponderation');
const questionController = require('../controllers/questionController');

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
// Add this line with your other client routes
router.delete('/clients/:id', adminController.deleteClient);
// Routes réponses
router.get('/responses', adminController.getAllResponses);
router.get('/responses/:userId', adminController.getUserResponses);
router.delete('/responses/:userId', adminController.deleteUserResponse); // A
// Routes admin
router.post('/create-admin', adminController.createAdmin);

// Routes questions
router.get('/questions', adminController.getAllQuestions);
router.get('/questions/category/:category', adminController.getQuestionsByCategory);
router.post('/questions', questionController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Routes catégories - FIXED: Properly organized category routes
// Special routes first (more specific paths)
router.post('/categories/:id/icon', uploadLogo.single('icon'), uploadIcon);
router.patch('/categories/:id/ordre', updateOrdre);

// General CRUD routes
router.get('/categories', getAllCategories);
router.post('/categories', uploadLogo.single('icon'), createCategorie);
router.get('/categories/:id', getCategorieById);
router.put('/categories/:id', uploadLogo.single('icon'), updateCategorie);
router.delete('/categories/:id', deleteCategorie);

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
// Replace your ponderation routes section with this cleaner version:

// Routes pondérations - Using controller methods
router.get('/ponderations', adminController.getAllPonderations);
router.post('/ponderations', adminController.createPonderation);
router.put('/ponderations/:id', adminController.updatePonderation);
router.delete('/ponderations/:id', adminController.deletePonderation);
module.exports = router;