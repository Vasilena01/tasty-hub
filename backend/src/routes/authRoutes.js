const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', login);

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
