const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/api/v1/userController');

// GET all users
router.get('/', userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// POST new user
router.post('/', userController.createUser);

// PUT & PATCH update user by ID
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.updateUser);

// DELETE user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;