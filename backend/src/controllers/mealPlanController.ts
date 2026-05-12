import { Response } from 'express';
import MealPlan from '../models/MealPlan';
import Recipe from '../models/Recipe';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiResponse } from '../types/api.types';
import { IMealPlan } from '../types/models.types';

interface AddToMealPlanRequest {
  recipe_id: number;
  week_start_date: string;
  day_of_week: number;
  meal_type: string;
}

interface UpdateMealPlanRequest {
  recipe_id: number;
}

/**
 * Get meal plan for a specific week
 * GET /api/meal-plans/week/:weekStartDate
 */
const getMealPlanForWeek = async (
  req: AuthRequest,
  res: Response<ApiResponse<any[]>>
): Promise<void> => {
  try {
    const { weekStartDate } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weekStartDate)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    const mealPlan = await MealPlan.findByWeek(userId, weekStartDate);

    res.status(200).json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meal plan'
    });
  }
};

/**
 * Add recipe to meal plan slot
 * POST /api/meal-plans
 */
const addRecipeToMealPlan = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { recipe_id, week_start_date, day_of_week, meal_type } = req.body as AddToMealPlanRequest;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate required fields
    if (!recipe_id || !week_start_date || day_of_week === undefined || !meal_type) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: recipe_id, week_start_date, day_of_week, meal_type'
      });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(week_start_date)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    // Validate day_of_week (0-6)
    if (day_of_week < 0 || day_of_week > 6) {
      res.status(400).json({
        success: false,
        message: 'Invalid day_of_week. Must be between 0 (Sunday) and 6 (Saturday)'
      });
      return;
    }

    // Validate meal_type
    const validMealTypes = ['breakfast', 'lunch', 'dinner'];
    if (!validMealTypes.includes(meal_type.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: 'Invalid meal_type. Must be breakfast, lunch, or dinner'
      });
      return;
    }

    // Verify recipe exists
    const recipe = await Recipe.findById(recipe_id);
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Create or update meal plan entry (upsert)
    const mealPlan = await MealPlan.create({
      user_id: userId,
      recipe_id,
      week_start_date,
      day_of_week,
      meal_type: meal_type.toLowerCase()
    });

    // Fetch the full meal plan entry with recipe details
    const fullMealPlan = await MealPlan.findByWeek(userId, week_start_date);
    const createdEntry = fullMealPlan.find(
      mp => mp.day_of_week === day_of_week && mp.meal_type === meal_type.toLowerCase()
    );

    res.status(201).json({
      success: true,
      message: 'Recipe added to meal plan successfully',
      data: createdEntry || mealPlan
    });
  } catch (error) {
    console.error('Error adding recipe to meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding recipe to meal plan'
    });
  }
};

/**
 * Update existing meal plan entry
 * PUT /api/meal-plans/:id
 */
const updateMealPlanEntry = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { recipe_id } = req.body as UpdateMealPlanRequest;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate required field
    if (!recipe_id) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: recipe_id'
      });
      return;
    }

    // Verify recipe exists
    const recipe = await Recipe.findById(recipe_id);
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Update meal plan entry
    const updatedMealPlan = await MealPlan.update(parseInt(id, 10), userId, { recipe_id });

    if (!updatedMealPlan) {
      res.status(404).json({
        success: false,
        message: 'Meal plan entry not found or you do not have permission to update it'
      });
      return;
    }

    // Fetch the full meal plan entry with recipe details
    const fullMealPlan = await MealPlan.findByWeek(userId, updatedMealPlan.week_start_date);
    const updatedEntry = fullMealPlan.find(mp => mp.id === parseInt(id, 10));

    res.status(200).json({
      success: true,
      message: 'Meal plan entry updated successfully',
      data: updatedEntry || updatedMealPlan
    });
  } catch (error) {
    console.error('Error updating meal plan entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating meal plan entry'
    });
  }
};

/**
 * Delete meal plan entry
 * DELETE /api/meal-plans/:id
 */
const deleteMealPlanEntry = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Delete meal plan entry
    const deletedMealPlan = await MealPlan.delete(parseInt(id, 10), userId);

    if (!deletedMealPlan) {
      res.status(404).json({
        success: false,
        message: 'Meal plan entry not found or you do not have permission to delete it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meal plan entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal plan entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting meal plan entry'
    });
  }
};

export { getMealPlanForWeek, addRecipeToMealPlan, updateMealPlanEntry, deleteMealPlanEntry };
