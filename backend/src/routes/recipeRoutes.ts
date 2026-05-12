import express, { Router } from 'express';
import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  getMyRecipes,
  getRecipesByUserId,
  updateRecipe,
  deleteRecipe,
  searchByIngredients,
  getFollowingRecipes
} from '../controllers/recipeController';
import { verifyToken } from '../middleware/authMiddleware';
const multer = require('../middleware/uploadMiddleware');

const router: Router = express.Router();

router.post('/', verifyToken, multer.single('image'), createRecipe);
router.get('/', getAllRecipes);
router.get('/my-recipes', verifyToken, getMyRecipes);
router.get('/user/:userId', getRecipesByUserId);
router.get('/following', verifyToken, getFollowingRecipes);
router.get('/search', searchByIngredients);
router.get('/:id', getRecipeById);
router.put('/:id', verifyToken, multer.single('image'), updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);

export default router;
