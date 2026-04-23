const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes (no auth required)
router.get('/', recipeController.getAllRecipes);
router.get('/search/by-ingredients', recipeController.searchByIngredients);

// Protected routes (auth required)
// Note: /user/me must come BEFORE /:id to prevent 'me' being parsed as an ID
router.get('/user/me', verifyToken, recipeController.getMyRecipes);

// More public routes (placed after specific routes to avoid conflicts)
router.get('/:id', recipeController.getRecipeById);
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);
router.put('/:id', verifyToken, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

module.exports = router;
