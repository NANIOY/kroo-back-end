const express = require('express');
const router = express.Router();
const crewController = require('../../../controllers/api/v1/crewController');

// POST new crew data
router.post('/', crewController.createOrUpdateCrewData);

// PUT & PATCH crew data
router.put('/', crewController.createOrUpdateCrewData);
router.patch('/', crewController.createOrUpdateCrewData);

module.exports = router;