// app.js
const express = require('express');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const cors = require('cors');
const app = express();
app.use(cors());
// Middleware pour parser le JSON
app.use(express.json());

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/questions', questionRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});