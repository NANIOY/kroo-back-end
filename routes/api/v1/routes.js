const express = require('express');
const router = express.Router();

// general routes
const { errorHandler } = require('../../../middlewares/errorHandler');
const usersRouter = require('../../../routes/api/v1/shared/user');
const mailRouter = require('../../../routes/api/v1/shared/mail');
const authRouter = require('../../../routes/api/v1/shared/auth');

// crew routes
const crewRouter = require('../../../routes/api/v1/crew/crew');
const crewJobRouter = require('../../../routes/api/v1/crew/crewJob');
const crewJobIntRouter = require('../../../routes/api/v1/crew/crewJobInt');

// business routes
const businessRouter = require('../../../routes/api/v1/business/business');
const bussJobRouter = require('../../../routes/api/v1/business/bussJob');
const bussJobIntRouter = require('../../../routes/api/v1/business/bussJobInt');


// general routes
router.use(errorHandler);
router.use('/api/v1/user', usersRouter);
router.use('/api/v1/mail', mailRouter);
router.use('/api/v1/auth', authRouter);

// crew routes
router.use('/api/v1/crew', crewRouter);
router.use('/api/v1/crew/crewJob', crewJobRouter);
router.use('/api/v1/crew/crewJobInt', crewJobIntRouter);

// business routes
router.use('/api/v1/business', businessRouter);
router.use('/api/v1/business/bussJob', bussJobRouter);
router.use('/api/v1/business/bussJobInt', bussJobIntRouter);

module.exports = router;