const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authenticate');
const jobIntController = require('../../../controllers/api/v1/jobIntController');

// GET all applications
router.get('/applications', authenticate, jobIntController.getApplications);

// GET application by ID
router.get('/applications/:applicationId', authenticate, jobIntController.getJobApplicationById);

// POST apply for job
router.post('/:jobId/apply', authenticate, jobIntController.applyJob);

// DELETE delete job application
router.delete('/:applicationId', authenticate, jobIntController.deleteJobApplication);

// GET saved jobs
router.get('/saved', authenticate, jobIntController.getSavedJobs);

// GET saved job by ID
router.get('/saved/:jobId', authenticate, jobIntController.getSavedJobById);

// POST save job
router.post('/:jobId/save', authenticate, jobIntController.saveJob);

// DELETE saved job
router.delete('/:jobId/unsave', authenticate, jobIntController.deleteSavedJob);

// POST offer job
router.post('/:jobId/offer', authenticate, jobIntController.offerJob);

module.exports = router;