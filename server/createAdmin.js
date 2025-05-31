const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connectez-vous à votre base de données
mongoose.connect('mongodb://root:Nhancit.com%402025@138.201.153.41:27017/survey_db?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schéma Admin
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'admin' });

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Supprimer les admins existants (optionnel)
    await Admin.deleteMany({});
    
    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Créer l'admin
    const admin = new Admin({
      username: 'superadmin',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('Admin créé avec succès!');
    console.log('Username: superadmin');
    console.log('Password: password123');
    console.log('Hash:', hashedPassword);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
    mongoose.connection.close();
  }
}

createAdmin();