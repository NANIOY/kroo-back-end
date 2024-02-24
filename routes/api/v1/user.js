const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/api/v1/userController');

// GET all users
router.get('/', userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// POST new user
router.post('/', userController.createUser);

module.exports = router;