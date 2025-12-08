const express = require('express');
const multer = require('multer');
const { showUploadForm, handleUpload } = require('../controllers/uploadController');

const router = express.Router();

// Set up disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});

const upload = multer({ storage });

// Routes
router.get('/', showUploadForm);
router.post('/', upload.single('photo'), handleUpload);

module.exports = router;
