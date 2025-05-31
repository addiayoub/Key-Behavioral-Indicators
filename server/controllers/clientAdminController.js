const Client = require('../models/Client');
const EmployeeResponse = require('../models/EmployeeResponse');

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const client = await Client.findOne({ 'admin.login': login });
    
    if (!client) return res.status(404).json({ message: 'Admin client non trouvé' });
    
    const isMatch = await client.compareAdminPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

    res.json({
      clientId: client._id,
      companyName: client.companyName,
      logo: client.logo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    const responses = await EmployeeResponse.find({ clientId: req.params.clientId });
    
    res.json({
      companyName: client.companyName,
      logo: client.logo,
      maxEmployees: client.maxEmployees,
      currentEmployees: client.currentEmployees,
      responsesCount: responses.length,
      responses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  