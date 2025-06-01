const Categorie = require('../models/Categorie');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Fonction utilitaire pour valider l'ID
const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};

// Fonction simplifiée pour trouver une catégorie par ID
const findCategorieById = async (id) => {
  try {
    console.log('🔍 Recherche catégorie ID:', id);
    
    if (!isValidId(id)) {
      console.log('❌ ID invalide');
      return null;
    }

    const categorie = await Categorie.findById(id);
    console.log(categorie ? '✅ Catégorie trouvée' : '❌ Catégorie non trouvée');
    
    return categorie;
  } catch (error) {
    console.error('❌ Erreur recherche catégorie:', error.message);
    return null;
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    console.log('📋 Récupération de toutes les catégories');
    const categories = await Categorie.find().sort({ ordre: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Erreur getAllCategories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCategorieById = async (req, res) => {
  try {
    console.log('🔍 Recherche catégorie par ID:', req.params.id);
    
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de catégorie invalide'
      });
    }

    const categorie = await findCategorieById(req.params.id);
    
    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    console.error('❌ Erreur getCategorieById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createCategorie = async (req, res) => {
  try {
    console.log('➕ Création catégorie:', req.body);
    
    const categorieData = { ...req.body };
    
    // Gestion du fichier uploadé
    if (req.file) {
      categorieData.icon = `/uploads/icons/${req.file.filename}`;
    }
    
    // S'assurer que l'ordre est un nombre
    if (categorieData.ordre !== undefined) {
      categorieData.ordre = Number(categorieData.ordre) || 0;
    }
    
    const categorie = await Categorie.create(categorieData);
    
    console.log('✅ Catégorie créée avec succès');
    
    res.status(201).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('❌ Erreur createCategorie:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateCategorie = async (req, res) => {
  try {
    console.log('🔄 === DÉBUT UPDATE CATÉGORIE ===');
    console.log('📝 ID reçu:', req.params.id);
    console.log('📝 Données reçues:', JSON.stringify(req.body, null, 2));
    
    // Validation de l'ID
    if (!isValidId(req.params.id)) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.log('❌ ID invalide:', req.params.id);
      return res.status(400).json({
        success: false,
        error: 'ID de catégorie invalide'
      });
    }

    // Recherche de la catégorie existante
    const existingCategorie = await findCategorieById(req.params.id);
    
    if (!existingCategorie) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.log('❌ Catégorie non trouvée pour mise à jour');
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    console.log('✅ Catégorie existante trouvée');
    
    // Préparation des données de mise à jour
    const updateData = { ...req.body };
    
    // Gestion de l'ordre
    if (updateData.ordre !== undefined) {
      updateData.ordre = Number(updateData.ordre) || 0;
    }
    
    // Gestion du nouveau fichier uploadé
    if (req.file) {
      updateData.icon = `/uploads/icons/${req.file.filename}`;
      
      // Supprimer l'ancien fichier si il existe
      if (existingCategorie.icon) {
        const oldFilePath = path.join(__dirname, '..', existingCategorie.icon);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log('🗑️ Ancien fichier supprimé');
          } catch (error) {
            console.log('⚠️ Erreur suppression ancien fichier:', error.message);
          }
        }
      }
    }
    
    console.log('📝 Données finales pour mise à jour:', JSON.stringify(updateData, null, 2));
    
    // Mise à jour de la catégorie
    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,           // Retourner la version mise à jour
        runValidators: true  // Exécuter les validateurs Mongoose
      }
    );
    
    if (!updatedCategorie) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.log('❌ Échec de la mise à jour');
      return res.status(404).json({
        success: false,
        error: 'Impossible de mettre à jour la catégorie'
      });
    }
    
    console.log('✅ Catégorie mise à jour avec succès');
    console.log('📄 Données mises à jour:', JSON.stringify(updatedCategorie, null, 2));
    console.log('🔄 === FIN UPDATE CATÉGORIE ===');
    
    res.status(200).json({
      success: true,
      data: updatedCategorie
    });
    
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('💥 Erreur updateCategorie:', error);
    
    // Message d'erreur plus spécifique
    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      errorMessage = 'Données invalides: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Format de données incorrect';
    }
    
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
};

exports.deleteCategorie = async (req, res) => {
  try {
    console.log('🗑️ Suppression catégorie:', req.params.id);
    
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de catégorie invalide'
      });
    }

    const categorie = await findCategorieById(req.params.id);
    
    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Supprimer le fichier icône si il existe
    if (categorie.icon) {
      const filePath = path.join(__dirname, '..', categorie.icon);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('🗑️ Fichier icône supprimé');
        } catch (error) {
          console.log('⚠️ Erreur suppression fichier:', error.message);
        }
      }
    }
    
    // Supprimer la catégorie
    await Categorie.findByIdAndDelete(req.params.id);
    
    console.log('✅ Catégorie supprimée avec succès');
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Catégorie supprimée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteCategorie:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.uploadIcon = async (req, res) => {
  try {
    console.log('📤 Upload icône pour catégorie:', req.params.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier n\'a été téléchargé'
      });
    }
    
    if (!isValidId(req.params.id)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'ID de catégorie invalide'
      });
    }

    const categorie = await findCategorieById(req.params.id);
    
    if (!categorie) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Supprimer l'ancien fichier si il existe
    if (categorie.icon) {
      const oldFilePath = path.join(__dirname, '..', categorie.icon);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log('🗑️ Ancien fichier icône supprimé');
        } catch (error) {
          console.log('⚠️ Erreur suppression ancien fichier:', error.message);
        }
      }
    }
    
    // Mettre à jour la catégorie avec la nouvelle icône
    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { icon: `/uploads/icons/${req.file.filename}` },
      { new: true }
    );
    
    console.log('✅ Icône mise à jour avec succès');
    
    res.status(200).json({
      success: true,
      data: updatedCategorie
    });
    
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Erreur uploadIcon:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateOrdre = async (req, res) => {
  try {
    console.log('🔄 === DÉBUT UPDATE ORDRE ===');
    console.log('📋 ID:', req.params.id);
    console.log('📋 Body:', req.body);
    
    const { ordre } = req.body;
    const categoryId = req.params.id;

    // Validation de l'ID
    if (!isValidId(categoryId)) {
      console.log('❌ ID invalide:', categoryId);
      return res.status(400).json({
        success: false,
        error: 'ID de catégorie invalide'
      });
    }

    // Validation de l'ordre
    if (ordre === undefined || ordre === null) {
      console.log('❌ Ordre manquant');
      return res.status(400).json({
        success: false,
        error: 'Le champ ordre est requis'
      });
    }

    const ordreNum = Number(ordre);
    if (![1, -1].includes(ordreNum)) {
      console.log('❌ Ordre invalide:', ordre);
      return res.status(400).json({
        success: false,
        error: 'Le champ ordre doit être 1 (monter) ou -1 (descendre)'
      });
    }

    // Recherche de la catégorie
    const categorie = await findCategorieById(categoryId);
    
    if (!categorie) {
      console.log('❌ Catégorie non trouvée');
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    console.log('✅ Catégorie trouvée');
    
    const currentOrder = Number(categorie.ordre) || 0;
    console.log('📊 Ordre actuel:', currentOrder);

    // Calculer le nouvel ordre
    let newOrder;
    
    if (ordreNum === 1) { // Monter (diminuer l'ordre)
      if (currentOrder <= 0) {
        console.log('⚠️ Déjà en première position');
        return res.status(400).json({
          success: false,
          error: 'La catégorie est déjà en première position'
        });
      }
      newOrder = currentOrder - 1;
      console.log('⬆️ Montée: nouvel ordre =', newOrder);
    } else { // Descendre (augmenter l'ordre)
      const totalCategories = await Categorie.countDocuments();
      const maxOrder = totalCategories - 1;
      
      if (currentOrder >= maxOrder) {
        console.log('⚠️ Déjà en dernière position');
        return res.status(400).json({
          success: false,
          error: 'La catégorie est déjà en dernière position'
        });
      }
      newOrder = currentOrder + 1;
      console.log('⬇️ Descente: nouvel ordre =', newOrder);
    }

    // Échanger les positions
    const targetCategory = await Categorie.findOne({ ordre: newOrder });
    if (targetCategory && targetCategory._id.toString() !== categorie._id.toString()) {
      console.log('🔄 Échange avec autre catégorie');
      await Categorie.findByIdAndUpdate(targetCategory._id, { ordre: currentOrder });
    }

    // Mettre à jour la catégorie principale
    const updatedCategorie = await Categorie.findByIdAndUpdate(
      categoryId,
      { ordre: newOrder },
      { new: true }
    );

    console.log('✅ Ordre mis à jour avec succès');

    // Retourner la liste mise à jour
    const categories = await Categorie.find().sort({ ordre: 1 });

    console.log('🔄 === FIN UPDATE ORDRE ===');

    res.status(200).json({
      success: true,
      message: 'Ordre mis à jour avec succès',
      data: updatedCategorie,
      allCategories: categories
    });
    
  } catch (error) {
    console.error('💥 Erreur updateOrdre:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};