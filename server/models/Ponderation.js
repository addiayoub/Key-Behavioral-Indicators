const mongoose = require('mongoose');

const ponderationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  possibilite: {
    type: [String],
    required: true
  },
  Pr: {
    type: Number,
    required: true
  },
  Co: {
    type: Number,
    required: true
  },
  Op: {
    type: Number,
    required: true
  },
  Ad: {
    type: Number,
    required: true
  },
  Ci: {
    type: Number,
    required: true
  }
}, { collection: 'ponderations' });

module.exports = mongoose.model('Ponderation', ponderationSchema);