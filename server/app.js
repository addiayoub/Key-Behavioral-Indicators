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
const app = express();

// Configuration CORS - Autoriser toutes les origines
app.use(cors({
  origin: '*', // Permet toutes les origines
  credentials: true
}));

// Configuration des limites de taille
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à la base de données
connectDB();

// Routes
app.use('/questions', questionRoutes);
app.use('/responses', userResponseRoutes);
app.use('/categories', categorieRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);
app.use('/employee', employeeRoutes);
app.use('/guest', guestRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API de gestion des questionnaires KBI');
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
});

module.exports = app;