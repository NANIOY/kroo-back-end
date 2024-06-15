const express = require('express');
const multer = require('multer');
const fileController = require('../../../controllers/api/v1/shared/fileController');
const authenticate = require('../../../middlewares/authenticate');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// upload an image
router.post('/uploadimage', upload.single('file'), fileController.uploadImage);

// upload a file
router.post('/uploadfile', upload.single('file'), fileController.uploadFile);

// upload portfolio work
router.post('/portfolio', authenticate, upload.single('file'), fileController.uploadPortfolio);

// update portfolio work
router.put('/portfolio/:id', authenticate, upload.single('file'), fileController.updatePortfolio);

module.exports = router;