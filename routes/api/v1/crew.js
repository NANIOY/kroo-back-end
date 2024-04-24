const express = require('express');
const router = express.Router();
const crewController = require('../../../controllers/api/v1/crew/crewController');

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

module.exports = router;