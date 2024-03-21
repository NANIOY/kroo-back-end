const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authenticate');
const crewJobIntController = require('../../../controllers/api/v1/crew/crewJobIntController');

// GET all applications
router.get('/applications', authenticate, crewJobIntController.getApplications);

// GET application by ID
router.get('/applications/:applicationId', authenticate, crewJobIntController.getJobApplicationById);

// POST apply for job
router.post('/:jobId/apply', authenticate, crewJobIntController.applyJob);

// DELETE delete job application
router.delete('/:applicationId', authenticate, crewJobIntController.deleteJobApplication);

// GET saved jobs
router.get('/saved', authenticate, crewJobIntController.getSavedJobs);

// GET saved job by ID
router.get('/saved/:jobId', authenticate, crewJobIntController.getSavedJobById);

// POST save job
router.post('/:jobId/save', authenticate, crewJobIntController.saveJob);

// DELETE saved job
router.delete('/:jobId/unsave', authenticate, crewJobIntController.deleteSavedJob);

module.exports = router;