const express = require('express');
const router = express.Router();
const {
  saveRecipe,
  getSavedRecipes,
  unsaveRecipe,
  checkSaved
} = require('../controllers/savedRecipeController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication

// @route   POST /api/saved-recipes/:recipeId
// @desc    Save a recipe
// @access  Private
router.post('/:recipeId', verifyToken, saveRecipe);

// @route   GET /api/saved-recipes
// @desc    Get user's saved recipes
// @access  Private
router.get('/', verifyToken, getSavedRecipes);

// @route   DELETE /api/saved-recipes/:recipeId
// @desc    Unsave a recipe
// @access  Private
router.delete('/:recipeId', verifyToken, unsaveRecipe);

// @route   GET /api/saved-recipes/check/:recipeId
// @desc    Check if user has saved a recipe
// @access  Private
router.get('/check/:recipeId', verifyToken, checkSaved);

module.exports = router;
