const express = require('express');
const router = express.Router();
const bussController = require('../../../controllers/api/v1/business/bussController');
const authenticate = require('../../../middlewares/authenticate');

// GET all businesses
router.get('/', bussController.getAllBusinesses);

// GET business by ID
router.get('/:id', bussController.getBusinessById);

// POST new business
router.post('/', authenticate, bussController.createBusiness);

// POST join business
router.post('/join', authenticate, bussController.joinBusiness);

// PUT & PATCH update business by ID
router.put('/:id', bussController.updateBusiness);
router.patch('/:id', bussController.updateBusiness);

// DELETE business by ID
router.delete('/:id', bussController.deleteBusiness);

module.exports = router;