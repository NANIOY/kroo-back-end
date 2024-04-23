const express = require('express');
const router = express.Router();
const crewController = require('../../../controllers/api/v1/crew/crewController');
const { uploadImage } = require('../../../middlewares/uploadImage');

// GET all crew data
router.get('/', crewController.getAllCrewData);

// GET crew data by ID
router.get('/:id', crewController.getCrewData);

// POST new crew data
router.post('/', crewController.createCrewData);

// PUT & PATCH crew data
router.put('/', crewController.updateCrewData);
router.patch('/', crewController.updateCrewData);

// DELETE crew data by ID
router.delete('/:id', crewController.deleteCrewData);

// POST route for handling image uploads
router.post('/upload-image', uploadImage, crewController.handleImageUpload);

module.exports = router;
