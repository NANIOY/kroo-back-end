const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authenticate');
const bussJobIntController = require('../../../controllers/api/v1/business/bussJobIntController');

// GET all business applications
router.get('/:id/applications', authenticate, bussJobIntController.getAllBusinessApplications);

// POST offer job
router.post('/:jobId/offer', authenticate, bussJobIntController.offerJob);

// POST accept application
router.post('/applications/:applicationId/accept', authenticate, bussJobIntController.acceptApplication);

// POST reject application
router.post('/applications/:applicationId/reject', authenticate, bussJobIntController.rejectApplication);

// GET all active crew 
router.get('/:id/activecrew', authenticate, bussJobIntController.getActiveCrewMembers);

// DELETE active crew member from job
router.delete('/:jobId/activecrew/:userId', authenticate, bussJobIntController.removeActiveCrewMember);

module.exports = router;