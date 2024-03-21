const express = require('express');
const router = express.Router();
const crewJobController = require('../../../controllers/api/v1/crew/crewJobController');
const authenticate = require('../../../middlewares/authenticate');

// GET all jobs
router.get('/jobs', crewJobController.getAllJobs);

// GET jobs assigned to logged in user
router.get('/crewjobs', authenticate, crewJobController.getCrewJobs);

// GET job by ID
router.get('/jobs/:id', crewJobController.getJobById);

module.exports = router;