const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { sendErrorResponse } = require('../utils/responseHandler');

// Multer configuration for file storage
const storage = multer.diskStorage({
  //where the uploaded files will be temperarily stored
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  //uuid to filename
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

// Multer configuration for file upload
const upload = multer({
  storage: storage,
  //file limit
  limits: { fileSize: 5 * 1024 * 1024 },
  //mimetype: csv only (with fallback to file extension)
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = file.originalname.toLowerCase().endsWith('.csv');
    
    if (isValidMimeType || isValidExtension) { 
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  },
});

/**
 * @function uploadCsvMiddleware
 * @description Middleware to handle CSV file uploads using Multer.
 * It configures storage, file size limits, and file type validation.
 * also handles errors and sends error responses.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const uploadCsvMiddleware = (req, res, next) => {
  upload.single('csvFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      //handling multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendErrorResponse(res, 400, 'File too large. Maximum 5MB allowed.');
      }
      return sendErrorResponse(res, 400, `File upload error: ${err.message}`);
    } else if (err) {
      //handling other file errors
      return sendErrorResponse(res, 400, err.message);
    }
    next(); //passing control
  });
};

module.exports = uploadCsvMiddleware;
