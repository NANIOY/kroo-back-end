const express = require('express');
const router = express.Router();

// general routes
const { errorHandler } = require('./middlewares/errorHandler');
const usersRouter = require('./routes/api/v1/user');
const mailRouter = require('./routes/api/v1/mail');
const authRouter = require('./routes/api/v1/auth');
const fileRouter = require('./routes/api/v1/file');
const calRouter = require('./routes/api/v1/calendar');
const geoRouter = require('./routes/api/v1/geo');

// crew routes
const crewRouter = require('./routes/api/v1/crew');
const crewJobRouter = require('./routes/api/v1/crewJob');
const crewJobIntRouter = require('./routes/api/v1/crewJobInt')
// business routes
const businessRouter = require('./routes/api/v1/business');
const bussJobRouter = require('./routes/api/v1/bussJob');
const bussJobIntRouter = require('./routes/api/v1/bussJobInt');


// general routes
router.use(errorHandler);
router.use('/api/v1/user', usersRouter);
router.use('/api/v1/mail', mailRouter);
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/file', fileRouter);
router.use('/api/v1/calendar', calRouter);
router.use('/api/v1/geo', geoRouter);

// crew routes
router.use('/api/v1/crew', crewRouter);
router.use('/api/v1/crewJob', crewJobRouter);
router.use('/api/v1/crewJobInt', crewJobIntRouter);

// business routes
router.use('/api/v1/business', businessRouter);
router.use('/api/v1/bussJob', bussJobRouter);
router.use('/api/v1/bussJobInt', bussJobIntRouter);

module.exports = router;