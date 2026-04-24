const express = require('express');
const router = express.Router();
const {
  submitRating,
  getRecipeRatings,
  deleteRating
} = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

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

module.exports = router;
