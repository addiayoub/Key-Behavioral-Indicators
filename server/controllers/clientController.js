const Client = require('../models/Client');
const Employee = require('../models/Employee');
const EmployeeResponse = require('../models/EmployeeResponse');
const UserResponse = require('../models/UserResponse');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ clientId: req.user.id }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getEmployeeResponsesFromEmployeeResponse = async (req, res) => {
  try {
    const { id } = req.params; // Client ID
    
    // Récupérer toutes les réponses pour ce client
    const responses = await EmployeeResponse.find({ 
      clientId: id 
    }).select('-__v'); // Exclure le champ __v
    
    if (!responses || responses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune réponse trouvée pour ce client'
      });
    }
    
    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des réponses'
    });
  }
};

// Ou pour récupérer par sessionId spécifique
exports.getResponseBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const response = await EmployeeResponse.findOne({ sessionId });
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Réponse non trouvée pour cette session'
      });
    }
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la réponse'
    });
  }
};
exports.getEmployeeResponses = async (req, res) => {
  try {
    const responses = await UserResponse.find({ userId: { $in: req.body.employeeIds } });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'ID est valide (format MongoDB ObjectId)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID client invalide'
      });
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Retourner seulement les informations nécessaires pour des raisons de sécurité
    const clientInfo = {
      _id: client._id,
      companyName: client.companyName,
      maxEmployees: client.maxEmployees,
      currentEmployees: client.currentEmployees,
      createdAt: client.createdAt,
      logo: client.logo
    };
    
    res.status(200).json({
      success: true,
      data: clientInfo
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du client'
    });
  }
};