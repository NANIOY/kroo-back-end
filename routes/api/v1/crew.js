const express = require('express');
const router = express.Router();
const crewController = require('../../../controllers/api/v1/crewController');

// POST new crew data
router.post('/', crewController.createCrewData);

module.exports = router;
