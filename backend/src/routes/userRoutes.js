const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
router.get('/:userId', userController.getUserById);

module.exports = router;
