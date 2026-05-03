const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes (no auth required)
router.get('/', recipeController.getAllRecipes);
router.get('/search/by-ingredients', recipeController.searchByIngredients);

// Protected routes with specific paths (must come before /:id)
router.get('/following', verifyToken, recipeController.getFollowingRecipes);
router.get('/user/me', verifyToken, recipeController.getMyRecipes);

// Public routes with dynamic segments
router.get('/user/:userId', recipeController.getRecipesByUserId);
router.get('/:id', recipeController.getRecipeById);

// Other protected routes
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);
router.put('/:id', verifyToken, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

module.exports = router;
