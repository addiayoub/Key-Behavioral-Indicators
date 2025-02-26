// app.js
const express = require('express');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const cors = require('cors');
const app = express();
const allowedOrigins = [
  'http://localhost:5173',                 // Frontend local (Vite par défaut)
  'https://k_b_i.vercel.app'        // Frontend déployé sur Vercel
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