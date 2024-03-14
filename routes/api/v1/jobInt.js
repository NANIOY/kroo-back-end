const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authenticate');
const jobIntController = require('../../../controllers/api/v1/jobIntController');

// POST apply for job
router.post('/:jobId/apply', authenticate, jobIntController.applyJob);

module.exports = router;