import express, { Router } from 'express';
import {
  submitRating,
  getRecipeRatings,
  deleteRating
} from '../controllers/ratingController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// @route   POST /api/ratings
// @desc    Submit or update rating
// @access  Private
router.post('/', verifyToken, submitRating);

// @route   GET /api/recipes/:id/ratings
// @desc    Get recipe ratings
// @access  Public (but returns user's rating if authenticated)
router.get('/recipes/:id/ratings', getRecipeRatings);

// @route   DELETE /api/ratings/:recipeId
// @desc    Delete user's rating
// @access  Private
router.delete('/:recipeId', verifyToken, deleteRating);

export default router;
