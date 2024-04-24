const express = require('express');
const multer = require('multer');
const fileController = require('../../../controllers/api/v1/shared/fileController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), fileController.upload);

module.exports = router;
