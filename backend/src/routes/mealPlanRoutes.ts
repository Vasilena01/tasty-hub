import express, { Router } from 'express';
import {
  getMealPlanForWeek,
  addRecipeToMealPlan,
  updateMealPlanEntry,
  deleteMealPlanEntry
} from '../controllers/mealPlanController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/week/:weekStartDate', verifyToken, getMealPlanForWeek);
router.post('/', verifyToken, addRecipeToMealPlan);
router.put('/:id', verifyToken, updateMealPlanEntry);
router.delete('/:id', verifyToken, deleteMealPlanEntry);

export default router;
