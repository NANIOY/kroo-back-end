const express = require('express');
const router = express.Router();
const bussJobController = require('../../../controllers/api/v1/business/bussJobController');
const authenticate = require('../../../middlewares/authenticate');

// GET all business jobs
router.get('/:id', authenticate, bussJobController.getAllBusinessJobs);

// GET job by ID
router.get('/:id/:jobId', authenticate, bussJobController.getJobById);

// POST new job
router.post('/', bussJobController.createJob);

// PUT & PATCH job by ID
router.put('/:id', bussJobController.updateJob);
router.patch('/:id', bussJobController.updateJob);

// DELETE job by ID
router.delete('/:id', bussJobController.deleteJob);

module.exports = router;