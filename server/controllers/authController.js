const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const Guest = require('../models/Guest');
const UserResponse = require('../models/UserResponse');

const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = generateToken(admin, 'admin');
    res.json({ token, role: 'admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clientAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const client = await Client.findOne({ adminUsername: username });
    if (!client) return res.status(404).json({ message: 'Client admin not found' });
    
    const isMatch = await client.compareAdminPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = generateToken(client, 'client-admin');
    res.json({ token, role: 'client-admin', companyName: client.companyName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.employeeLogin = async (req, res) => {
  try {
    const { login, password } = req.body;
    const client = await Client.findOne({ 'employeeAccess.login': login });
    
    if (!client) return res.status(404).json({ message: 'Accès employé non trouvé' });
    
    const isMatch = await bcrypt.compare(password, client.employeeAccess.password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });
    
    if (client.currentEmployees >= client.maxEmployees) {
      return res.status(400).json({ message: 'Nombre maximum de participants atteint' });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    res.json({ 
      sessionId,
      clientId: client._id,
      companyName: client.companyName 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.guestAccess = async (req, res) => {
  try {
    const sessionId = require('crypto').randomBytes(16).toString('hex');
    const guest = new Guest({ sessionId });
    await guest.save();
    res.json({ sessionId, role: 'guest' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission' });
    }
    next();
  };
};