const Client = require('../models/Client');
const Employee = require('../models/EmployeeResponse');
const UserResponse = require('../models/UserResponse');
const Categorie = require('../models/Categorie');
const Question = require('../models/Question');
const Ponderation = require('../models/Ponderation');
const Admin = require('../models/Admin');
const fs = require('fs');
const path = require('path');
const KeyResponse = require('../models/KeyResponse');
const mongoose = require('mongoose');
const EmployeeResponse = require('../models/EmployeeResponse');

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
// Add this method to your adminController.js

exports.deleteUserResponse = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete the user response
    const userResponse = await UserResponse.findOneAndDelete({ userId });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'User response not found' });
    }
    
    // Also delete the associated key response
    await KeyResponse.findOneAndDelete({ userId });
    
    res.json({ 
      message: 'User responses deleted successfully',
      deletedUserId: userId
    });
    
  } catch (error) {
    console.error('Error deleting user response:', error);
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
    
    // Validate required fields
    if (!companyName || !adminLogin || !adminPassword || !employeeLogin || !employeePassword) {
      return res.status(400).json({ 
        message: 'All required fields must be provided',
        required: ['companyName', 'adminLogin', 'adminPassword', 'employeeLogin', 'employeePassword']
      });
    }
    
    // Check if company name already exists
    const existingCompany = await Client.findOne({ companyName: companyName.trim() });
    if (existingCompany) {
      return res.status(409).json({ 
        message: 'Company name already exists',
        field: 'companyName'
      });
    }
    
    // Check if admin login already exists
    const existingAdmin = await Client.findOne({ 'admin.login': adminLogin.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: 'Admin login already exists',
        field: 'adminLogin'
      });
    }
    
    const client = await Client.create({
      companyName: companyName.trim(),
      logo: logo || null,
      admin: {
        login: adminLogin.toLowerCase().trim(),
        password: adminPassword
      },
      employeeAccess: {
        login: employeeLogin.toLowerCase().trim(),
        password: employeePassword
      },
      maxEmployees: maxEmployees || 10,
      currentEmployees: 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: {
        _id: client._id,
        companyName: client.companyName,
        logo: client.logo,
        adminLogin: client.admin.login,
        employeeLogin: client.employeeAccess.login,
        maxEmployees: client.maxEmployees,
        currentEmployees: client.currentEmployees,
        createdAt: client.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating client:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(409).json({ 
        message: `Duplicate value for ${field}: ${value}`,
        field: field,
        type: 'duplicate_key_error'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      type: 'server_error'
    });
  }
};

// Updated updateClient method
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updateData = { ...req.body };
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    
    // Handle password updates
    if (updateData.adminPassword) {
      updateData['admin.password'] = updateData.adminPassword;
      delete updateData.adminPassword;
    }
    
    if (updateData.employeePassword) {
      updateData['employeeAccess.password'] = updateData.employeePassword;
      delete updateData.employeePassword;
    }
    
    // Handle login updates
    if (updateData.adminLogin) {
      updateData['admin.login'] = updateData.adminLogin.toLowerCase().trim();
      delete updateData.adminLogin;
    }
    
    if (updateData.employeeLogin) {
      updateData['employeeAccess.login'] = updateData.employeeLogin.toLowerCase().trim();
      delete updateData.employeeLogin;
    }
    
    // Trim company name
    if (updateData.companyName) {
      updateData.companyName = updateData.companyName.trim();
    }
    
    const client = await Client.findByIdAndUpdate(
      clientId, 
      updateData, 
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );
    
    if (!client) {
      return res.status(404).json({ 
        message: 'Client not found',
        clientId 
      });
    }
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      client
    });
    
  } catch (error) {
    console.error('Error updating client:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `Value already exists for ${field}`,
        field: field,
        type: 'duplicate_key_error'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      type: 'server_error'
    });
  }
};
// Alternative version with cascade deletion
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { force } = req.query; // Allow ?force=true in URL
    
    // Find the client first
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Check for associated data
    const [employeeCount, responseCount] = await Promise.all([
      Employee.countDocuments({ clientId }),
      UserResponse.countDocuments({ clientId })
    ]);
    
    // If force=true, delete associated data
    if (force === 'true') {
      await Promise.all([
        Employee.deleteMany({ clientId }),
        UserResponse.deleteMany({ clientId })
      ]);
    } else if (employeeCount > 0 || responseCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete client. Found ${employeeCount} employees and ${responseCount} responses. Use ?force=true to force deletion.`
      });
    }
    
    // Delete the client
    await Client.findByIdAndDelete(clientId);
    
    // Clean up logo file
    if (client.logo) {
      const logoPath = path.join(__dirname, '../uploads/logos', path.basename(client.logo));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    res.json({ 
      message: 'Client deleted successfully',
      deletedClient: {
        _id: client._id,
        companyName: client.companyName
      },
      cascadeDeleted: force === 'true' ? {
        employees: employeeCount,
        responses: responseCount
      } : null
    });
    
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: error.message });
  }
};
// Mise à jour d'un client
// Ajoutez ces méthodes à votre adminController.js

// Obtenir le profil de l'admin connecté
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }
    
    res.json({
      success: true,
      admin: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur getAdminProfile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil admin (username et/ou password)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const adminId = req.user.id;
    
    // Récupérer l'admin avec le mot de passe pour vérification
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }
    
    // Vérifier le mot de passe actuel si on veut changer des informations
    if (currentPassword && !(await admin.comparePassword(currentPassword))) {
      return res.status(400).json({ 
        message: 'Mot de passe actuel incorrect',
        field: 'currentPassword'
      });
    }
    
    const updateData = {};
    
    // Mettre à jour le username si fourni
    if (username && username.trim() !== admin.username) {
      // Vérifier si le nouveau username existe déjà
      const existingAdmin = await Admin.findOne({ 
        username: username.trim(),
        _id: { $ne: adminId }
      });
      
      if (existingAdmin) {
        return res.status(409).json({ 
          message: 'Ce nom d\'utilisateur existe déjà',
          field: 'username'
        });
      }
      
      updateData.username = username.trim();
    }
    
    // Mettre à jour le mot de passe si fourni
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Le mot de passe actuel est requis pour changer le mot de passe',
          field: 'currentPassword'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
          field: 'newPassword'
        });
      }
      
      updateData.password = newPassword;
    }
    
    // Si aucune donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'Aucune modification à apporter'
      });
    }
    
    // Effectuer la mise à jour
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      admin: {
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        role: updatedAdmin.role,
        createdAt: updatedAdmin.createdAt
      }
    });
    
  } catch (error) {
    console.error('Erreur updateAdminProfile:', error);
    
    // Gérer les erreurs de validation
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    // Gérer les erreurs de clé dupliquée
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Ce nom d\'utilisateur existe déjà',
        field: 'username'
      });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Ajoutez cette méthode dans votre adminController.js

// Solution 1: Vérifier d'abord où sont stockées les réponses des employés
// Version corrigée et simplifiée de getAllEmployeesWithResponses
exports.getAllEmployeesWithResponses = async (req, res) => {
  try {
    const { clientId, limit, skip, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
    console.log('Paramètres reçus:', { clientId, limit, skip, sortBy, sortOrder });
    
    // Construction du filtre pour les employés
    let employeeFilter = {};
    if (clientId) {
      employeeFilter.clientId = new mongoose.Types.ObjectId(clientId);
    }
    
    // Récupérer tous les employés avec pagination optionnelle
    const employeesQuery = Employee.find(employeeFilter).select('-password');
    
    if (limit) {
      employeesQuery.limit(parseInt(limit));
    }
    if (skip) {
      employeesQuery.skip(parseInt(skip));
    }
    
    employeesQuery.sort({ [sortBy]: parseInt(sortOrder) });
    const employees = await employeesQuery.exec();
    
    console.log(`Employés trouvés: ${employees.length}`);
    
    // Si on filtre par clientId, récupérer toutes les réponses de ce client
    let allResponses = [];
    
    if (clientId) {
      // Récupérer toutes les réponses pour ce client
      allResponses = await EmployeeResponse.find({
        clientId: new mongoose.Types.ObjectId(clientId)
      }).sort({ createdAt: -1 });
      
      console.log(`Réponses trouvées pour le client ${clientId}: ${allResponses.length}`);
    } else {
      // Si pas de clientId spécifique, récupérer toutes les réponses
      allResponses = await EmployeeResponse.find({}).sort({ createdAt: -1 });
      console.log(`Total des réponses: ${allResponses.length}`);
    }
    
    // Récupérer les informations des clients
    const clientIds = [...new Set(employees.map(emp => emp.clientId?.toString()).filter(Boolean))];
    const clients = await Client.find({ _id: { $in: clientIds } }).select('companyName logo');
    
    // Créer un map pour faciliter la recherche des clients
    const clientsMap = new Map();
    clients.forEach(client => {
      clientsMap.set(client._id.toString(), client);
    });
    
    // Créer un map pour les réponses par employé
    // La clé sera basée sur différents critères possibles
    const responsesMap = new Map();
    
    allResponses.forEach(response => {
      // Créer une clé de recherche basée sur les informations disponibles
      let searchKeys = [];
      
      // Utiliser employeeId si disponible
      if (response.employeeId) {
        searchKeys.push(response.employeeId.toString());
      }
      
      // Utiliser sessionId si disponible
      if (response.sessionId) {
        searchKeys.push(response.sessionId);
      }
      
      // Utiliser userId si disponible
      if (response.userId) {
        searchKeys.push(response.userId);
      }
      
      // Essayer de matcher avec les employés
      employees.forEach(employee => {
        const empId = employee._id.toString();
        
        // Vérifier si une des clés correspond à l'ID de l'employé
        if (searchKeys.includes(empId)) {
          if (!responsesMap.has(empId)) {
            responsesMap.set(empId, []);
          }
          responsesMap.get(empId).push(response);
        }
        
        // Vérifier si le sessionId contient des informations de l'employé
        // ou si d'autres champs correspondent
        if (response.employeeEmail && employee.email === response.employeeEmail) {
          if (!responsesMap.has(empId)) {
            responsesMap.set(empId, []);
          }
          responsesMap.get(empId).push(response);
        }
        
        if (response.employeeName && employee.name === response.employeeName) {
          if (!responsesMap.has(empId)) {
            responsesMap.set(empId, []);
          }
          responsesMap.get(empId).push(response);
        }
      });
    });
    
    console.log(`Réponses mappées pour ${responsesMap.size} employés`);
    
    // Combiner les données des employés avec leurs réponses
    const employeesWithResponses = employees.map(employee => {
      const empId = employee._id.toString();
      const empResponses = responsesMap.get(empId) || [];
      const client = clientsMap.get(employee.clientId?.toString());
      
      // Calculer les statistiques
      const totalResponses = empResponses.length;
      const lastResponseDate = empResponses.length > 0 ? empResponses[0].createdAt : null;
      const averageScore = empResponses.length > 0 
        ? empResponses.reduce((sum, resp) => sum + (resp.score || 0), 0) / empResponses.length 
        : null;
      
      return {
        // Informations de base de l'employé
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        clientId: employee.clientId,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        
        // Informations du client
        client: client ? {
          _id: client._id,
          companyName: client.companyName,
          logo: client.logo
        } : null,
        
        // Statistiques des réponses
        responseStats: {
          totalResponses,
          lastResponseDate,
          averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null
        },
        
        // Toutes les réponses détaillées
        responses: empResponses.map(response => ({
          _id: response._id,
          sessionId: response.sessionId,
          userId: response.userId,
          employeeId: response.employeeId,
          
          // Scores détaillés
          scores: {
            total: {
              score: response.score,
              rawScore: response.rawScore,
              maxPossible: response.maxPossible
            },
            categories: response.categoryScores || [],
            kbi: {
              profile: response.profile,
              Pr: response.Pr,
              Co: response.Co,
              Op: response.Op,
              Ad: response.Ad,
              Ci: response.Ci,
              KBICONSO: response.KBICONSO
            }
          },
          
          // Réponses aux questions
          questionResponses: response.responses || [],
          
          // Réponses clés
          keyResponses: response.keyResponses || {},
          
          // Métadonnées
          metadata: {
            userAgent: response.metadata?.userAgent,
            ipAddress: response.metadata?.ipAddress,
            completionTime: response.metadata?.completionTime,
            language: response.metadata?.language || 'fr',
            ponderationFound: response.metadata?.ponderationFound,
            ponderationId: response.metadata?.ponderationId
          },
          
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        }))
      };
    });
    
    // Statistiques globales
    const totalEmployees = await Employee.countDocuments(employeeFilter);
    const totalResponses = allResponses.length;
    const employeesWithResponsesCount = employeesWithResponses.filter(emp => emp.responses.length > 0).length;
    
    res.json({
      success: true,
      data: {
        employees: employeesWithResponses,
        pagination: {
          total: totalEmployees,
          returned: employees.length,
          limit: limit ? parseInt(limit) : null,
          skip: skip ? parseInt(skip) : 0
        },
        statistics: {
          totalEmployees,
          totalResponses,
          employeesWithResponses: employeesWithResponsesCount,
          employeesWithoutResponses: totalEmployees - employeesWithResponsesCount,
          averageResponsesPerEmployee: totalEmployees > 0 ? Math.round((totalResponses / totalEmployees) * 100) / 100 : 0
        },
        debug: {
          searchCriteria: {
            clientId: clientId,
            employeeFilter: employeeFilter
          },
          responsesFound: {
            totalResponses: allResponses.length,
            employeesWithMappedResponses: responsesMap.size
          },
          mappingDetails: Array.from(responsesMap.entries()).map(([empId, responses]) => ({
            employeeId: empId,
            responseCount: responses.length,
            sessionIds: responses.map(r => r.sessionId)
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur getAllEmployeesWithResponses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des employés avec leurs réponses',
      error: error.message 
    });
  }
};

// Méthode alternative spécifiquement pour un client
// Fixed version of getAllEmployeesWithResponses method
exports.getAllEmployeesWithResponses = async (req, res) => {
  try {
    const { clientId, limit, skip, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
    console.log('Paramètres reçus:', { clientId, limit, skip, sortBy, sortOrder });
    
    // Construction du filtre pour les employés
    let employeeFilter = {};
    if (clientId) {
      employeeFilter.clientId = new mongoose.Types.ObjectId(clientId);
    }
    
    // Récupérer tous les employés avec pagination optionnelle
    const employeesQuery = Employee.find(employeeFilter).select('-password');
    
    if (limit) {
      employeesQuery.limit(parseInt(limit));
    }
    if (skip) {
      employeesQuery.skip(parseInt(skip));
    }
    
    employeesQuery.sort({ [sortBy]: parseInt(sortOrder) });
    const employees = await employeesQuery.exec();
    
    console.log(`Employés trouvés: ${employees.length}`);
    
    // CORRECTION: Récupérer les réponses avec le bon filtre
    let responseFilter = {};
    if (clientId) {
      responseFilter.clientId = new mongoose.Types.ObjectId(clientId);
    }
    
    const allResponses = await EmployeeResponse.find(responseFilter).sort({ createdAt: -1 });
    console.log(`Réponses trouvées: ${allResponses.length}`);
    
    // Récupérer les informations des clients
    const clientIds = [...new Set(employees.map(emp => emp.clientId?.toString()).filter(Boolean))];
    const clients = await Client.find({ _id: { $in: clientIds } }).select('companyName logo');
    
    // Créer un map pour faciliter la recherche des clients
    const clientsMap = new Map();
    clients.forEach(client => {
      clientsMap.set(client._id.toString(), client);
    });
    
    // CORRECTION: Améliorer le mapping des réponses
    const responsesMap = new Map();
    
    // Debug: afficher quelques exemples de réponses pour comprendre la structure
    if (allResponses.length > 0) {
      console.log('Exemple de réponse:', {
        _id: allResponses[0]._id,
        clientId: allResponses[0].clientId,
        employeeId: allResponses[0].employeeId,
        sessionId: allResponses[0].sessionId,
        userId: allResponses[0].userId
      });
    }
    
    // Debug: afficher quelques exemples d'employés
    if (employees.length > 0) {
      console.log('Exemple d\'employé:', {
        _id: employees[0]._id,
        name: employees[0].name,
        email: employees[0].email,
        clientId: employees[0].clientId
      });
    }
    
    allResponses.forEach(response => {
      let matchedEmployeeId = null;
      
      // Stratégie 1: Correspondance directe par employeeId
      if (response.employeeId) {
        const empIdStr = response.employeeId.toString();
        const matchingEmployee = employees.find(emp => emp._id.toString() === empIdStr);
        if (matchingEmployee) {
          matchedEmployeeId = matchingEmployee._id.toString();
          console.log(`Correspondance trouvée par employeeId: ${empIdStr}`);
        }
      }
      
      // Stratégie 2: Si employeeId est un sessionId, chercher par sessionId patterns
      if (!matchedEmployeeId && response.sessionId) {
        // Parfois le sessionId peut contenir des informations utiles
        const sessionId = response.sessionId.toString();
        
        // Si le sessionId commence par "session_" et contient un timestamp
        if (sessionId.startsWith('session_')) {
          // Dans ce cas, nous devons trouver une autre méthode de correspondance
          // Peut-être par timing ou par d'autres métadonnées
          
          // Pour l'instant, essayons de voir si il y a une correspondance par email ou nom
          if (response.employeeEmail) {
            const matchingEmployee = employees.find(emp => emp.email === response.employeeEmail);
            if (matchingEmployee) {
              matchedEmployeeId = matchingEmployee._id.toString();
              console.log(`Correspondance trouvée par email: ${response.employeeEmail}`);
            }
          }
          
          if (!matchedEmployeeId && response.employeeName) {
            const matchingEmployee = employees.find(emp => emp.name === response.employeeName);
            if (matchingEmployee) {
              matchedEmployeeId = matchingEmployee._id.toString();
              console.log(`Correspondance trouvée par nom: ${response.employeeName}`);
            }
          }
        }
      }
      
      // Stratégie 3: Si aucune correspondance directe, essayer par userId
      if (!matchedEmployeeId && response.userId) {
        const userIdStr = response.userId.toString();
        const matchingEmployee = employees.find(emp => emp._id.toString() === userIdStr);
        if (matchingEmployee) {
          matchedEmployeeId = matchingEmployee._id.toString();
          console.log(`Correspondance trouvée par userId: ${userIdStr}`);
        }
      }
      
      // NOUVELLE STRATÉGIE: Si l'employeeId est un sessionId, 
      // chercher dans la collection Employee pour voir si ce sessionId correspond à un employé
      if (!matchedEmployeeId && response.employeeId && response.employeeId.toString().startsWith('session_')) {
        // Dans ce cas, l'employeeId est probablement un identifiant de session
        // Nous devons utiliser d'autres critères pour faire la correspondance
        
        // Option 1: Correspondance par timing (employé créé récemment avant la réponse)
        const responseTime = new Date(response.createdAt);
        const candidateEmployees = employees.filter(emp => {
          const empCreationTime = new Date(emp.createdAt);
          const timeDiff = responseTime - empCreationTime;
          // Si l'employé a été créé dans les 24 heures avant la réponse
          return timeDiff >= 0 && timeDiff <= 24 * 60 * 60 * 1000;
        });
        
        if (candidateEmployees.length === 1) {
          matchedEmployeeId = candidateEmployees[0]._id.toString();
          console.log(`Correspondance trouvée par timing: employé ${matchedEmployeeId} pour session ${response.employeeId}`);
        } else if (candidateEmployees.length > 1) {
          console.log(`Plusieurs candidats trouvés pour la session ${response.employeeId}:`, candidateEmployees.map(e => e._id));
          // Prendre le plus récent
          candidateEmployees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          matchedEmployeeId = candidateEmployees[0]._id.toString();
          console.log(`Prise du plus récent: ${matchedEmployeeId}`);
        }
      }
      
      // Si on a trouvé une correspondance, ajouter la réponse
      if (matchedEmployeeId) {
        if (!responsesMap.has(matchedEmployeeId)) {
          responsesMap.set(matchedEmployeeId, []);
        }
        responsesMap.get(matchedEmployeeId).push(response);
      } else {
        console.log('❌ Réponse non mappée:', {
          responseId: response._id,
          employeeId: response.employeeId,
          sessionId: response.sessionId,
          userId: response.userId,
          employeeEmail: response.employeeEmail,
          employeeName: response.employeeName,
          createdAt: response.createdAt
        });
      }
    });
    
    console.log(`Responsesmap contient ${responsesMap.size} employés avec des réponses`);
    
    // Combiner les données des employés avec leurs réponses
    const employeesWithResponses = employees.map(employee => {
      const empId = employee._id.toString();
      const empResponses = responsesMap.get(empId) || [];
      const client = clientsMap.get(employee.clientId?.toString());
      
      // Calculer les statistiques
      const totalResponses = empResponses.length;
      const lastResponseDate = empResponses.length > 0 ? empResponses[0].createdAt : null;
      const averageScore = empResponses.length > 0 
        ? empResponses.reduce((sum, resp) => sum + (resp.score || 0), 0) / empResponses.length 
        : null;
      
      return {
        // Informations de base de l'employé
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        clientId: employee.clientId,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        
        // Informations du client
        client: client ? {
          _id: client._id,
          companyName: client.companyName,
          logo: client.logo
        } : null,
        
        // Statistiques des réponses
        responseStats: {
          totalResponses,
          lastResponseDate,
          averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null
        },
        
        // Toutes les réponses détaillées
        responses: empResponses.map(response => ({
          _id: response._id,
          sessionId: response.sessionId,
          userId: response.userId,
          employeeId: response.employeeId,
          
          // Scores détaillés
          scores: {
            total: {
              score: response.score,
              rawScore: response.rawScore,
              maxPossible: response.maxPossible
            },
            categories: response.categoryScores || [],
            kbi: {
              profile: response.profile,
              Pr: response.Pr,
              Co: response.Co,
              Op: response.Op,
              Ad: response.Ad,
              Ci: response.Ci,
              KBICONSO: response.KBICONSO
            }
          },
          
          // Réponses aux questions
          questionResponses: response.responses || [],
          
          // Réponses clés
          keyResponses: response.keyResponses || {},
          
          // Métadonnées
          metadata: {
            userAgent: response.metadata?.userAgent,
            ipAddress: response.metadata?.ipAddress,
            completionTime: response.metadata?.completionTime,
            language: response.metadata?.language || 'fr',
            ponderationFound: response.metadata?.ponderationFound,
            ponderationId: response.metadata?.ponderationId
          },
          
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        }))
      };
    });
    
    // Statistiques globales
    const totalEmployees = await Employee.countDocuments(employeeFilter);
    const totalResponses = allResponses.length;
    const employeesWithResponsesCount = employeesWithResponses.filter(emp => emp.responses.length > 0).length;
    
    res.json({
      success: true,
      data: {
        employees: employeesWithResponses,
        pagination: {
          total: totalEmployees,
          returned: employees.length,
          limit: limit ? parseInt(limit) : null,
          skip: skip ? parseInt(skip) : 0
        },
        statistics: {
          totalEmployees,
          totalResponses,
          employeesWithResponses: employeesWithResponsesCount,
          employeesWithoutResponses: totalEmployees - employeesWithResponsesCount,
          averageResponsesPerEmployee: totalEmployees > 0 ? Math.round((totalResponses / totalEmployees) * 100) / 100 : 0
        },
        debug: {
          searchCriteria: {
            clientId: clientId,
            employeeFilter: employeeFilter,
            responseFilter: responseFilter
          },
          responsesFound: {
            totalResponses: allResponses.length,
            employeesWithMappedResponses: responsesMap.size
          },
          mappingDetails: Array.from(responsesMap.entries()).map(([empId, responses]) => ({
            employeeId: empId,
            responseCount: responses.length,
            sessionIds: responses.map(r => r.sessionId),
            employeeIds: responses.map(r => r.employeeId)
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur getAllEmployeesWithResponses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des employés avec leurs réponses',
      error: error.message 
    });
  }
};

// Méthode alternative pour récupérer un employé spécifique avec ses réponses
exports.getEmployeeWithResponses = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Récupérer l'employé
    const employee = await Employee.findById(employeeId).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employé non trouvé' 
      });
    }
    
    // Récupérer les réponses de l'employé
    const responses = await EmployeeResponse.find({ 
      employeeId: employeeId 
    }).sort({ createdAt: -1 });
    
    // Récupérer les informations du client
    const client = employee.clientId ? await Client.findById(employee.clientId).select('companyName logo') : null;
    
    res.json({
      success: true,
      data: {
        // Informations de l'employé
        employee: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          clientId: employee.clientId,
          isActive: employee.isActive,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt
        },
        
        // Informations du client
        client: client ? {
          _id: client._id,
          companyName: client.companyName,
          logo: client.logo
        } : null,
        
        // Statistiques des réponses
        responseStats: {
          totalResponses: responses.length,
          lastResponseDate: responses.length > 0 ? responses[0].createdAt : null,
          averageScore: responses.length > 0 
            ? responses.reduce((sum, resp) => sum + (resp.score || 0), 0) / responses.length 
            : null,
          completionDates: responses.map(r => r.createdAt)
        },
        
        // Toutes les réponses
        responses: responses.map(response => ({
          _id: response._id,
          sessionId: response.sessionId,
          userId: response.userId,
          scores: {
            total: {
              score: response.score,
              rawScore: response.rawScore,
              maxPossible: response.maxPossible
            },
            categories: response.categoryScores || [],
            kbi: {
              profile: response.profile,
              Pr: response.Pr,
              Co: response.Co,
              Op: response.Op,
              Ad: response.Ad,
              Ci: response.Ci,
              KBICONSO: response.KBICONSO
            }
          },
          questionResponses: response.responses || [],
          keyResponses: response.keyResponses || {},
          metadata: response.metadata || {},
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        }))
      }
    });
    
  } catch (error) {
    console.error('Erreur getEmployeeWithResponses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de l\'employé avec ses réponses',
      error: error.message 
    });
  }
};
// Changer uniquement le mot de passe
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;
    
    // Validation des données
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        field: 'newPassword'
      });
    }
    
    // Récupérer l'admin
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }
    
    // Vérifier le mot de passe actuel
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(400).json({ 
        message: 'Mot de passe actuel incorrect',
        field: 'currentPassword'
      });
    }
    
    // Mettre à jour le mot de passe
    admin.password = newPassword;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
    
  } catch (error) {
    console.error('Erreur changeAdminPassword:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    console.error('Erreur createQuestion:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// Add these methods to your existing adminController.js file

// Add this method to handle ponderation creation
exports.createPonderation = async (req, res) => {
  try {
    const { id, possibilite, Pr, Co, Op, Ad, Ci } = req.body;
    
    // Check if ponderation with this ID already exists
    const existingPonderation = await Ponderation.findOne({ id });
    if (existingPonderation) {
      return res.status(400).json({ message: 'Une pondération avec cet ID existe déjà' });
    }
    
    const newPonderation = new Ponderation({
      id,
      possibilite,
      Pr,
      Co,
      Op,
      Ad,
      Ci
    });
    
    const savedPonderation = await newPonderation.save();
    res.status(201).json(savedPonderation);
  } catch (error) {
    console.error('Erreur création pondération:', error);
    res.status(400).json({ message: error.message });
  }
};

// Add this method to get all ponderations
exports.getAllPonderations = async (req, res) => {
  try {
    const ponderations = await Ponderation.find().sort({ id: 1 });
    res.json(ponderations);
  } catch (error) {
    console.error('Erreur getAllPonderations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add this method to delete ponderations
exports.deletePonderation = async (req, res) => {
  try {
    const ponderation = await Ponderation.findByIdAndDelete(req.params.id);
    if (!ponderation) {
      return res.status(404).json({ message: 'Pondération non trouvée' });
    }
    res.json({ message: 'Pondération supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression pondération:', error);
    res.status(500).json({ message: error.message });
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