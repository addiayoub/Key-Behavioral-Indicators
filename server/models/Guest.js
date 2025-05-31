const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  responses: { type: Object },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

module.exports = mongoose.model('Guest', guestSchema);