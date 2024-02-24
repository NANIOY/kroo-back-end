const express = require('express');
const router = express.Router();
const businessController = require('../../../controllers/api/v1/businessController');

// POST new business
router.post('/', businessController.createBusiness);

module.exports = router;