const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  logo: { 
    type: String,
    default: null 
  },
  admin: {
    login: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6 
    }
  },
  employeeAccess: {
    login: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6 
    }
  },
  maxEmployees: { 
    type: Number, 
    required: true, 
    default: 10,
    min: 1 
  },
  currentEmployees: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index for employee access (more efficient than separate unique indexes)
clientSchema.index({ 'employeeAccess.login': 1, companyName: 1 });

// Pre-save middleware for password hashing
clientSchema.pre('save', async function(next) {
  try {
    // Update timestamp
    this.updatedAt = new Date();
    
    // Hash admin password if modified
    if (this.isModified('admin.password')) {
      this.admin.password = await bcrypt.hash(this.admin.password, 12);
    }
    
    // Hash employee password if modified
    if (this.isModified('employeeAccess.password')) {
      this.employeeAccess.password = await bcrypt.hash(this.employeeAccess.password, 12);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware for password hashing
clientSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    
    // Set updated timestamp
    if (update.$set) {
      update.$set.updatedAt = new Date();
    } else {
      update.updatedAt = new Date();
    }
    
    // Hash admin password if being updated
    if (update['admin.password']) {
      update['admin.password'] = await bcrypt.hash(update['admin.password'], 12);
    }
    
    // Hash employee password if being updated
    if (update['employeeAccess.password']) {
      update['employeeAccess.password'] = await bcrypt.hash(update['employeeAccess.password'], 12);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods for password comparison
clientSchema.methods.compareAdminPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.admin.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

clientSchema.methods.compareEmployeePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.employeeAccess.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if client can add more employees
clientSchema.methods.canAddEmployee = function() {
  return this.currentEmployees < this.maxEmployees;
};

// Method to increment employee count
clientSchema.methods.addEmployee = async function() {
  if (this.canAddEmployee()) {
    this.currentEmployees += 1;
    return await this.save();
  }
  throw new Error('Maximum employee limit reached');
};

// Method to decrement employee count
clientSchema.methods.removeEmployee = async function() {
  if (this.currentEmployees > 0) {
    this.currentEmployees -= 1;
    return await this.save();
  }
  throw new Error('No employees to remove');
};

// Static method to find client by admin login
clientSchema.statics.findByAdminLogin = function(login) {
  return this.findOne({ 'admin.login': login.toLowerCase().trim() });
};

// Static method to find client by employee login
clientSchema.statics.findByEmployeeLogin = function(login) {
  return this.findOne({ 'employeeAccess.login': login.toLowerCase().trim() });
};

// Transform output to remove sensitive data
clientSchema.methods.toJSON = function() {
  const clientObject = this.toObject();
  delete clientObject.admin.password;
  delete clientObject.employeeAccess.password;
  return clientObject;
};

module.exports = mongoose.model('Client', clientSchema);