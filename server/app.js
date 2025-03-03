  const express = require('express');
  const connectDB = require('./config/db');
  const questionRoutes = require('./routes/questionRoutes');
  const userResponseRoutes = require('./routes/userResponseRoutes');
  const cors = require('cors');

  const app = express();

  // Configuration CORS
  const allowedOrigins = [
    'http://192.168.11.141:5173',          // Frontend local (Vite par défaut)   
    'http://localhost:5173'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true
  }));

  // Middleware pour parser le JSON
  app.use(express.json());

  // Connexion à la base de données
  connectDB();

  // Routes
  app.use('/api/questions', questionRoutes);
  app.use('/api/responses', userResponseRoutes);

  // Route de base pour vérifier que le serveur fonctionne
  app.get('/', (req, res) => {
    res.send('API de gestion des questionnaires KBI');
  });

  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0'; // Permet d'accepter les connexions externes
  app.listen(PORT, HOST, () => {
    console.log(`Serveur lancé sur http://${HOST}:${PORT}`);
  });

  module.exports = app;