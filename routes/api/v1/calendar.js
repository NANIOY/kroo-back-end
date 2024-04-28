const express = require('express');
const router = express.Router();
const calendarController = require('../../../controllers/api/v1/shared/calController');

router.get('/google', calendarController.getAuthUrl);
router.get('/google/redirect', calendarController.getTokens);
router.post('/google/schedule_event', calendarController.scheduleEvent);

module.exports = router;
