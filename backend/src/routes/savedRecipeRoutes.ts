import express, { Router } from 'express';
import {
  saveRecipe,
  getSavedRecipes,
  unsaveRecipe,
  checkSaved
} from '../controllers/savedRecipeController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/:recipeId', verifyToken, saveRecipe);
router.get('/', verifyToken, getSavedRecipes);
router.delete('/:recipeId', verifyToken, unsaveRecipe);
router.get('/check/:recipeId', verifyToken, checkSaved);

export default router;
