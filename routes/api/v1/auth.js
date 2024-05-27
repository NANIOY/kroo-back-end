const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/api/v1/shared/authController');

// handle user login
router.post('/login', authController.login);

// handle user logout
router.post('/logout', authController.logout);

// handle switch role login
router.post('/switch-role', authController.switchRole);

// reset password
router.patch('/reset-password', authController.resetPassword);
router.put('/reset-password', authController.resetPassword);

module.exports = router;