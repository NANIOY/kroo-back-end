const express = require('express');
const router = express.Router();
const jobController = require('../../../controllers/api/v1/jobController');
const authenticate = require('../../../middlewares/authenticate');

// GET all jobs
router.get('/', authenticate, jobController.getUserJobs);

// GET job by ID
router.get('/:id', jobController.getJobById);

// POST new job
router.post('/', jobController.createJob);

// PUT & PATCH job by ID
router.put('/:id', jobController.updateJob);
router.patch('/:id', jobController.updateJob);

// DELETE job by ID
router.delete('/:id', jobController.deleteJob);

module.exports = router;