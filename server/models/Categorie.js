const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: {
    fr: {
      type: String,
      required: true,
      trim: true
    },
    en: {
      type: String,
      required: true,
      trim: true
    }
  },
  description: {
    fr: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  icon: {
    type: String,     // Va stocker le chemin de l'image ou l'URL
    default: null
  },
  ordre: {
    type: Number,
    default: 0        // Par défaut, l'ordre est 0 (sera affiché en premier)
  },
  estActive: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;