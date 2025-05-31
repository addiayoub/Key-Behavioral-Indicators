const Client = require('../models/Client');
const Employee = require('../models/Employee');
const UserResponse = require('../models/UserResponse');
const Categorie = require('../models/Categorie');
const Question = require('../models/Question');
const Ponderation = require('../models/Ponderation');
const Admin = require('../models/Admin');
const fs = require('fs');
const path = require('path');
const KeyResponse = require('../models/KeyResponse');

// Nouvelle fonction pour les statistiques du dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalClients,
      activeClients,
      totalEmployees,
      totalResponses
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ currentEmployees: { $gt: 0 } }),
      Employee.countDocuments(),
      UserResponse.countDocuments()
    ]);

    res.json({
      totalClients,
      activeClients,
      totalEmployees,
      totalResponses
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const clients = await Client.find()
      .select('-adminPassword')
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Ajoutez cette fonction dans votre adminController.js
exports.getAllResponses = async (req, res) => {
  try {
    // Récupérer toutes les réponses utilisateur
    const userResponses = await UserResponse.find().sort({ createdAt: -1 });
    
    // Récupérer toutes les réponses clés
    const userIds = userResponses.map(response => response.userId);
    const keyResponses = await KeyResponse.find({ userId: { $in: userIds } });
    
    // Créer un map pour faciliter la recherche
    const keyResponsesMap = new Map();
    keyResponses.forEach(kr => {
      keyResponsesMap.set(kr.userId, kr);
    });
    
    // Combiner les données
    const combinedResponses = userResponses.map(response => {
      const keyResponse = keyResponsesMap.get(response.userId);
      
      return {
        userId: response.userId,
        responses: response.responses,
        categoryScores: response.categoryScores,
        totalScore: {
          score: response.score,
          rawScore: response.rawScore,
          maxPossible: response.maxPossible
        },
        kbiScores: {
          profile: response.profile,
          Pr: response.Pr,
          Co: response.Co,
          Op: response.Op,
          Ad: response.Ad,
          Ci: response.Ci,
          KBICONSO: response.KBICONSO
        },
        keyResponses: keyResponse ? {
          industry: keyResponse.industry,
          industryAng: keyResponse.industryAng,
          organizationType: keyResponse.organizationType,
          organizationTypeAng: keyResponse.organizationTypeAng,
          changePhase: keyResponse.changePhase,
          changePhaseAng: keyResponse.changePhaseAng
        } : null,
        createdAt: response.createdAt
      };
    });
    
    res.json(combinedResponses);
  } catch (error) {
    console.error('Erreur getAllResponses:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.getClientEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ clientId: req.params.clientId }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserResponses = async (req, res) => {
  try {
    const responses = await UserResponse.findOne({ userId: req.params.userId });
    if (!responses) return res.status(404).json({ message: 'Responses not found' });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour upload de logo
exports.uploadClientLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Logo uploadé avec succès',
      logo: logoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erreur upload logo:', error);
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour supprimer un logo
exports.deleteClientLogo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/logos', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Logo supprimé avec succès' });
    } else {
      res.status(404).json({ message: 'Logo non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression logo:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { 
      companyName, 
      logo, 
      adminLogin, 
      adminPassword,
      employeeLogin, 
      employeePassword, 
      maxEmployees 
    } = req.body;
    
    const client = await Client.create({
      companyName,
      logo,
      admin: {
        login: adminLogin,
        password: adminPassword
      },
      employeeAccess: {
        login: employeeLogin,
        password: employeePassword
      },
      maxEmployees,
      currentEmployees: 0
    });
    
    res.status(201).json({
      _id: client._id,
      companyName: client.companyName,
      logo: client.logo,
      adminLogin: client.admin.login,
      employeeLogin: client.employeeAccess.login,
      maxEmployees: client.maxEmployees
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mise à jour d'un client
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updateData = req.body;
    
    // Si un nouveau mot de passe admin est fourni, l'encoder
    if (updateData.adminPassword) {
      updateData['admin.password'] = updateData.adminPassword;
      delete updateData.adminPassword;
    }
    
    // Si un nouveau mot de passe employé est fourni, l'encoder
    if (updateData.employeePassword) {
      updateData['employeeAccess.password'] = updateData.employeePassword;
      delete updateData.employeePassword;
    }
    
    // Mise à jour des autres champs
    if (updateData.adminLogin) {
      updateData['admin.login'] = updateData.adminLogin;
      delete updateData.adminLogin;
    }
    
    if (updateData.employeeLogin) {
      updateData['employeeAccess.login'] = updateData.employeeLogin;
      delete updateData.employeeLogin;
    }
    
    const client = await Client.findByIdAndUpdate(
      clientId, 
      updateData, 
      { 
        new: true,
        runValidators: true 
      }
    ).select('-admin.password -employeeAccess.password');
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json({
      message: 'Client mis à jour avec succès',
      client
    });
  } catch (error) {
    console.error('Erreur mise à jour client:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getClientResponses = async (req, res) => {
  try {
    const responses = await UserResponse.find({ clientId: req.params.clientId });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vérifier si le username existe déjà
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Créer le nouvel admin
    const admin = await Admin.create({ username, password });
    
    // Retourner l'admin sans le mot de passe
    const adminResponse = {
      _id: admin._id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt
    };
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: adminResponse
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Add these methods to your adminController.js file

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ id: 1 });
    res.json(questions);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Recherche de la catégorie:', category);
        
    const questions = await Question.find({
      $or: [{ category }, { categoryAng: category }]
    }).sort({ id: 1 });
        
    console.log('Questions trouvées:', questions);
        
    if (questions.length === 0) {
      return res.status(404).json({ message: 'Aucune question trouvée pour cette catégorie' });
    }
        
    res.json(questions);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { id, question, questionAng, required, answers, answersAng, Note, category, categoryAng } = req.body;
    
    const newQuestion = new Question({
      id,
      question,
      questionAng,
      required,
      answers,
      answersAng,
      Note,
      category,
      categoryAng
    });
    
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }
    res.json({ message: 'Question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Categorie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePonderation = async (req, res) => {
  try {
    const ponderation = await Ponderation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ponderation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};