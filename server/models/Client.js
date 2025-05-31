const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  logo: { type: String },
  admin: {
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  employeeAccess: {
    login: { type: String, required: true },
    password: { type: String, required: true }
  },
  maxEmployees: { type: Number, required: true, default: 10 },
  currentEmployees: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

clientSchema.pre('save', async function(next) {
  if (this.isModified('admin.password')) {
    this.admin.password = await bcrypt.hash(this.admin.password, 10);
  }
  if (this.isModified('employeeAccess.password')) {
    this.employeeAccess.password = await bcrypt.hash(this.employeeAccess.password, 10);
  }
  next();
});

clientSchema.methods.compareAdminPassword = async function(password) {
  return await bcrypt.compare(password, this.admin.password);
};

module.exports = mongoose.model('Client', clientSchema);