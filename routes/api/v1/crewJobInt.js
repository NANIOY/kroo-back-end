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

// GET offered jobs
router.get('/offers', authenticate, crewJobIntController.getOfferedJobs);

// GET offered job by ID
router.get('/offers/:jobId', authenticate, crewJobIntController.getOfferedJobById);

// POST accept job offer
router.post('/offers/:jobId/accept', authenticate, crewJobIntController.acceptOffer);

module.exports = router;