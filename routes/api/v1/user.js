const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/api/v1/userController');

// GET all users
router.get('/', userController.getAllUsers);

// POST new user
router.post('/', userController.createUser);

module.exports = router;