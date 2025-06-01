const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const {
  getAllCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  updateOrdre
} = require('../controllers/categorieController');
const uploadIcon = require('../config/uploadIcon');
const categorieController = require('../controllers/categorieController');

// Routes spécifiques AVANT les routes avec paramètres
router.route('/:id/ordre')
  .put(updateOrdre)
  .patch(updateOrdre); // Garder les deux pour compatibilité

router.post('/:id/icon', uploadIcon.single('icon'), categorieController.uploadIcon);


// Routes générales
router.route('/')
  .get(getAllCategories)
  .post(upload.single('icon'), createCategorie);

// Routes avec paramètres ID (APRÈS les routes spécifiques)
router.route('/:id')
  .get(getCategorieById)
  .put(upload.single('icon'), updateCategorie)
  .delete(deleteCategorie);

module.exports = router;