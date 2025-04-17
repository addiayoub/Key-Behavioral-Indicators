const express = require('express');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const userResponseRoutes = require('./routes/userResponseRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configuration CORS
const allowedOrigins = process.env.FRONTEND_URL ? 
  process.env.FRONTEND_URL.split(',') : ''
  

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

// Configuration des limites de taille
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Connexion à la base de données
connectDB();

// Routes
app.use('/questions', questionRoutes);
app.use('/responses', userResponseRoutes);

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