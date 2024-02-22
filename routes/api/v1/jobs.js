const express = require('express');
const router = express.Router();
const jobController = require('../../../controllers/api/v1/jobController');

// GET all shoe orders
router.get('/', jobController.getJobs);

// GET shoe order by ID
router.get('/:id', jobController.getJobById);

// POST new shoe order
router.post('/', jobController.createJob);

// PUT & PATCH shoe order by ID
router.put('/:id', jobController.updateJob);
router.patch('/:id', jobController.updateJob);

module.exports = router;