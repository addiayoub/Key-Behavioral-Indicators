const EmployeeResponse = require('../models/EmployeeResponse');
const Client = require('../models/Client');
const Employee = require('../models/Employee');

exports.saveResponse = async (req, res) => {
  try {
    const { sessionId, clientId, responses, employeeName, employeeEmail } = req.body;
    
    // Vérifier si la session existe déjà
    const existingResponse = await EmployeeResponse.findOne({ sessionId });
    if (existingResponse) {
      return res.status(400).json({ message: 'Session déjà utilisée' });
    }
    
    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    
    // Vérifier la limite d'employés
    if (client.currentEmployees >= client.maxEmployees) {
      return res.status(400).json({ message: 'Nombre maximum de participants atteint' });
    }
    
    // Créer l'employé dans la collection Employee
    const newEmployee = await Employee.create({
      name: employeeName || `Employé-${sessionId}`, // Nom par défaut si non fourni
      email: employeeEmail || `employee-${sessionId}@${client.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      clientId: clientId,
      sessionId: sessionId,
      isActive: true
    });
    
    // Sauvegarder les réponses avec référence à l'employé
    const newResponse = await EmployeeResponse.create({
      clientId,
      employeeId: newEmployee._id, // Ajouter la référence à l'employé
      sessionId,
      responses
    });
    
    // Incrémenter le nombre d'employés actuels
    await Client.findByIdAndUpdate(clientId, { 
      $inc: { currentEmployees: 1 } 
    });
    
    res.status(201).json({
      message: 'Réponses sauvegardées avec succès',
      response: newResponse,
      employee: {
        _id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email
      }
    });
  } catch (error) {
    console.error('Erreur saveResponse:', error);
    res.status(500).json({ message: error.message });
  }
};