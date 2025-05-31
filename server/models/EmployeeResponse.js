const mongoose = require('mongoose');

const employeeResponseSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  sessionId: { type: String, required: true, unique: true },
  responses: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmployeeResponse', employeeResponseSchema);