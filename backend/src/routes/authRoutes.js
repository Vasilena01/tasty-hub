const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getAllUsers } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', login);

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyToken, updateProfile);

// GET /api/auth/users - Get all users for discovery
router.get('/users', getAllUsers);

module.exports = router;
