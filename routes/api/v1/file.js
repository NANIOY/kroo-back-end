const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../../../controllers/api/v1/shared/fileController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;