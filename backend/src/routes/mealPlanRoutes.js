const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/week/:weekStartDate', verifyToken, mealPlanController.getMealPlanForWeek);
router.post('/', verifyToken, mealPlanController.addRecipeToMealPlan);
router.put('/:id', verifyToken, mealPlanController.updateMealPlanEntry);
router.delete('/:id', verifyToken, mealPlanController.deleteMealPlanEntry);

module.exports = router;
