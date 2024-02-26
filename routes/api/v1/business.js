const express = require('express');
const router = express.Router();
const businessController = require('../../../controllers/api/v1/businessController');

// POST email to invited employees
router.post('/:id/invite', businessController.sendInvite);

// GET all businesses
router.get('/', businessController.getAllBusinesses);

// GET business by ID
router.get('/:id', businessController.getBusinessById);

// POST new business
router.post('/', businessController.createBusiness);

// PUT & PATCH update business by ID
router.put('/:id', businessController.updateBusiness);
router.patch('/:id', businessController.updateBusiness);

// DELETE business by ID
router.delete('/:id', businessController.deleteBusiness);

module.exports = router;