const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const {
  getAllCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  uploadIcon,
  updateOrdre
} = require('../controllers/categorieController');

// Routes pour les catégories
router.route('/')
  .get(getAllCategories)
  .post(upload.single('icon'), createCategorie);

router.route('/:id')
  .get(getCategorieById)
  .put(upload.single('icon'), updateCategorie)
  .delete(deleteCategorie);

// Route spécifique pour le téléchargement d'icône
router.route('/:id/icon')
  .post(upload.single('icon'), uploadIcon);

// Route spécifique pour mettre à jour l'ordre
router.route('/:id/ordre')
  .patch(updateOrdre);

module.exports = router;