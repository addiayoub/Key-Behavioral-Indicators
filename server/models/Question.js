// Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,  // Pour gérer les ObjectId de MongoDB
  id: Number,
  question: String,
  required: Boolean,
  answers: [String],
  category: String
}, { collection: 'questions' });  // Utiliser la collection existante 'questions'

module.exports = mongoose.model('Question', questionSchema);