const express = require('express');
const router = express.Router();
const businessController = require('../../../controllers/api/v1/businessController');

// GET all businesses
router.get('/', businessController.getAllBusinesses);

// GET business by ID
router.get('/:id', businessController.getBusinessById);

// POST new business
router.post('/', businessController.createBusiness);

// PUT & PATCH update business by ID

// DELETE business by ID

module.exports = router;