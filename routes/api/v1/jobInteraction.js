const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authenticate');
const jobInteractionController = require('../../../controllers/api/v1/jobInteractionController');

// POST apply for job
router.post('/:jobId/apply', authenticate, jobInteractionController.applyJob);

module.exports = router;
