const multer = require('multer');
const path = require('path');

// Configure storage - using memory storage for base64 conversion
const storage = multer.memoryStorage();

// File filter to allow only specific image types
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidType = allowedTypes.includes(file.mimetype);
  const isValidExt = allowedExtensions.includes(ext);
  
  if (isValidType && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

// File filter to allow only PDF files
const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidType = file.mimetype === 'application/pdf';
  const isValidExt = ext === '.pdf';
  
  if (isValidType && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// Configure multer with 10MB limit for images
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Configure multer for PDF uploads (5MB limit)
const uploadPdf = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Error handler middleware for Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isPdfRoute = req.originalUrl.includes('/extract-skills-pdf');
      return res.status(413).json({
        message: isPdfRoute
          ? 'File too large. Maximum size is 5MB for PDF files.'
          : 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, uploadPdf, handleMulterError };
