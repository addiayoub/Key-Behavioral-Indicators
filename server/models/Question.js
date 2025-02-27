const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  question: String,
  questionAng: String,
  required: Boolean,
  answers: [String],
  answersAng: [String],
  Note: [Number],           // Notes correspondantes aux réponses
  category: String,         // Catégorie en français
  categoryAng: String       // Catégorie en anglais
}, { collection: 'questions' });

module.exports = mongoose.model('Question', questionSchema);