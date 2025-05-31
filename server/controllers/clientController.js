const Employee = require('../models/Employee');
const UserResponse = require('../models/UserResponse');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ clientId: req.user.id }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
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