const express = require('express');
const multer = require('multer');
const { showUploadForm, handleUpload } = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ dest: 'public/uploads/' });

router.get('/', showUploadForm);
router.post('/', upload.single('photo'), handleUpload);

module.exports = router;

