// Dans un nouveau fichier uploadIcon.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const iconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/icons');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'icon-' + uniqueSuffix + ext);
  }
});

const uploadIcon = multer({ 
  storage: iconStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = uploadIcon;