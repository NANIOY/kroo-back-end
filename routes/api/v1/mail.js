const express = require('express');
const router = express.Router();
const mailController = require('../../../controllers/api/v1/mailController');

// POST email to invited employees
router.post('/:id/invite', mailController.sendInvite);

// POST request for password reset
router.post('/passwordreset', mailController.sendPasswordResetEmail);

module.exports = router;