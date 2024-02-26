const express = require('express');
const router = express.Router();
const crewController = require('../../../controllers/api/v1/crewController');

// GET crew data by ID
// router.get('/:id', crewController.getCrewDataById);

// POST new crew data
router.post('/', crewController.createCrewData);

// // PUT & PATCH crew data
// router.put('/', crewController.createOrUpdateCrewData);
// router.patch('/', crewController.createOrUpdateCrewData);

module.exports = router;