const express = require('express');
const router = express.Router();
const geoController = require('../../../controllers/api/v1/shared/geoController');

// GET coordinates by city and country
router.get('/coordinates', geoController.getCoordinates);

module.exports = router;