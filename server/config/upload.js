const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configurer le stockage des logos clients
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/logos';
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Filtre pour n'accepter que les images
const logoFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers d\'image (JPG, PNG, GIF, WebP) sont autorisés!'), false);
  }
};

const uploadLogo = multer({
  storage: logoStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // limite à 10MB pour les logos
    files: 1 // Un seul fichier à la fois
  },
  fileFilter: logoFileFilter
});

module.exports = uploadLogo;