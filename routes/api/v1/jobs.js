const express = require('express');
const router = express.Router();
const jobController = require('../../../controllers/api/v1/jobController');

// GET all shoe orders
router.get('/', jobController.getJobs);

// POST new shoe order
router.post('/', jobController.createJob);

module.exports = router;