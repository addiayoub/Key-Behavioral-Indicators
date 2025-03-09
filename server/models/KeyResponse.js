const mongoose = require('mongoose');

const keyResponseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  industry: String,
  industryAng: String,
  organizationType: String,
  organizationTypeAng: String,
  changePhase: String,
  changePhaseAng: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'key_responses' });

module.exports = mongoose.model('KeyResponse', keyResponseSchema);