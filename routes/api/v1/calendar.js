const express = require('express');
const router = express.Router();
const calendarController = require('../../../controllers/api/v1/shared/calController');

// GET auth URL
router.get('/google', calendarController.getAuthUrl);

// GET tokens
router.get('/google/redirect', calendarController.getTokens);

// POST schedule event
router.post('/google/schedule_event', calendarController.scheduleEvent);

// GET all events
router.get('/google/events', calendarController.listEvents);

module.exports = router;