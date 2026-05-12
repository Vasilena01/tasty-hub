import express, { Router } from 'express';
import { register, login, updateProfile, getAllUsers } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', login);

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyToken, updateProfile);

// GET /api/auth/users - Get all users for discovery
router.get('/users', getAllUsers);

export default router;
