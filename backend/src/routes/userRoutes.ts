import express, { Router } from 'express';
import { getUserById } from '../controllers/userController';

const router: Router = express.Router();

// Public routes
router.get('/:userId', getUserById);

export default router;
