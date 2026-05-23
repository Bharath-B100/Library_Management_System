const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('uploads/covers');
ensureDir('uploads/pdfs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      cb(null, 'uploads/covers');
    } else if (file.fieldname === 'pdfFile') {
      cb(null, 'uploads/pdfs');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed for cover'), false);
    }
  } else if (file.fieldname === 'pdfFile') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

module.exports = upload;
