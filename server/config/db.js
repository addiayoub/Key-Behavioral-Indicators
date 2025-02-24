// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nhancit:9tl5sg3ZHIqwZTTk@key-behavioral-indicato.iohrh.mongodb.net/survey_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connecté avec succès à survey_db');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;