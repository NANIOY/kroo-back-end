const express = require('express');
const router = express.Router();
const mailController = require('../../../controllers/api/v1/mailController');

// POST email to invited employees
router.post('/:id/invite', mailController.sendInvite);

module.exports = router;