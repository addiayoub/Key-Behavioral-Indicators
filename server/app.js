const express = require('express');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const userResponseRoutes = require('./routes/userResponseRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const guestRoutes = require('./routes/guestRoutes');
const clientAdminRoutes = require('./routes/clientAdminRoutes');

// Charger les variables d'environnement
require('dotenv').config();

const app = express();

// Configuration CORS améliorée
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des domaines autorisés
    const allowedOrigins = [
      'https://kbi.nhancit.com',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Enlever les valeurs undefined
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Origin non autorisé:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://api.nhancit.com data: blob:;"
  );
  next();
});
// Middleware pour gérer les requêtes OPTIONS manuellement (fallback)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }
  next();
});

// Configuration des limites de taille
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/icons', express.static(path.join(__dirname, 'uploads', 'icons')));

// Connexion à la base de données
connectDB();

// Routes
app.use('/questions', questionRoutes);
app.use('/responses', userResponseRoutes);
app.use('/categories', categorieRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/client-admin', clientAdminRoutes);
app.use('/client', clientRoutes);
app.use('/employee', employeeRoutes);
app.use('/guest', guestRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API de gestion des questionnaires KBI');
});

// Middleware de débogage CORS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Serveur lancé sur http://${HOST}:${PORT}`);
  console.log('CORS configuré pour:', corsOptions.origin);
});

module.exports = app;