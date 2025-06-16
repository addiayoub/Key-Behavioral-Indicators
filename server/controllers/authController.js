const Admin = require('../models/Admin');
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
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
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username et password requis' 
      });
    }

    const client = await Client.findOne({ 
      'employeeAccess.login': username 
    });
    
    if (!client) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    const isMatch = await bcrypt.compare(password, client.employeeAccess.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    const token = jwt.sign(
      { 
        clientId: client._id,
        companyName: client.companyName,
        role: 'employee',
        login: username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      client: {
        _id: client._id,
        companyName: client.companyName,
        logo: client.logo, // Assurez-vous que le modèle Client a ce champ
        maxEmployees: client.maxEmployees,
        currentEmployees: client.currentEmployees
      }
    });
    
  } catch (error) {
    console.error('Erreur employeeLogin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
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