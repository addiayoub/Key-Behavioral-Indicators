const Categorie = require('../models/Categorie');
const fs = require('fs');
const path = require('path');

// Obtenir toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const lang = req.query.lang || 'fr'; // Langue par défaut est le français
    
    // Récupérer les catégories et les trier par ordre croissant
    const categories = await Categorie.find().sort({ ordre: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtenir une catégorie par ID
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Créer une nouvelle catégorie
exports.createCategorie = async (req, res) => {
  try {
    const categorieData = { ...req.body };
    
    // Si un fichier a été téléchargé, ajouter le chemin à l'objet de catégorie
    if (req.file) {
      categorieData.icon = `/uploads/icons/${req.file.filename}`;
    }
    
    // S'assurer que l'ordre est un nombre
    if (categorieData.ordre !== undefined) {
      categorieData.ordre = Number(categorieData.ordre);
    }
    
    const categorie = await Categorie.create(categorieData);
    
    res.status(201).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    // Si une erreur se produit et qu'un fichier a été téléchargé, le supprimer
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour une catégorie
exports.updateCategorie = async (req, res) => {
  try {
    const categorieData = { ...req.body };
    const existingCategorie = await Categorie.findById(req.params.id);
    
    if (!existingCategorie) {
      // Si un fichier a été téléchargé, le supprimer
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // S'assurer que l'ordre est un nombre
    if (categorieData.ordre !== undefined) {
      categorieData.ordre = Number(categorieData.ordre);
    }
    
    // Si un fichier a été téléchargé, ajouter le chemin à l'objet de catégorie
    // et supprimer l'ancien fichier s'il existe
    if (req.file) {
      categorieData.icon = `/uploads/icons/${req.file.filename}`;
      
      // Supprimer l'ancien fichier si existant
      if (existingCategorie.icon) {
        const oldFilePath = path.join(__dirname, '..', existingCategorie.icon);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
    
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      categorieData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    // Si une erreur se produit et qu'un fichier a été téléchargé, le supprimer
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer une catégorie
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    
    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Supprimer le fichier d'icône si existant
    if (categorie.icon) {
      const filePath = path.join(__dirname, '..', categorie.icon);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Categorie.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Télécharger une icône pour une catégorie existante
exports.uploadIcon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier n\'a été téléchargé'
      });
    }
    
    const categorie = await Categorie.findById(req.params.id);
    
    if (!categorie) {
      // Supprimer le fichier téléchargé
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Supprimer l'ancien fichier si existant
    if (categorie.icon) {
      const oldFilePath = path.join(__dirname, '..', categorie.icon);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Mettre à jour le chemin de l'icône
    categorie.icon = `/uploads/icons/${req.file.filename}`;
    await categorie.save();
    
    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour l'ordre d'une catégorie
// Mettre à jour l'ordre d'une catégorie
exports.updateOrdre = async (req, res) => {
  try {
    const { ordre } = req.body;
    const categoryId = req.params.id;
    
    if (ordre === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Le champ ordre est requis'
      });
    }
    
    const categorie = await Categorie.findById(categoryId);
    
    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    const currentOrder = categorie.ordre || 0;
    const direction = Number(ordre); // 1 for up, -1 for down
    
    if (direction === 1) {
      // Moving up: decrease order number
      const newOrder = Math.max(0, currentOrder - 1);
      
      // Find category with the target order and swap
      const targetCategory = await Categorie.findOne({ ordre: newOrder });
      if (targetCategory && targetCategory._id.toString() !== categoryId) {
        targetCategory.ordre = currentOrder;
        await targetCategory.save();
      }
      
      categorie.ordre = newOrder;
      await categorie.save();
    } else if (direction === -1) {
      // Moving down: increase order number
      const maxOrder = await Categorie.countDocuments();
      const newOrder = Math.min(maxOrder - 1, currentOrder + 1);
      
      // Find category with the target order and swap
      const targetCategory = await Categorie.findOne({ ordre: newOrder });
      if (targetCategory && targetCategory._id.toString() !== categoryId) {
        targetCategory.ordre = currentOrder;
        await targetCategory.save();
      }
      
      categorie.ordre = newOrder;
      await categorie.save();
    } else {
      // Direct order assignment
      categorie.ordre = Number(ordre);
      await categorie.save();
    }
    
    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    console.error('Erreur updateOrdre:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};