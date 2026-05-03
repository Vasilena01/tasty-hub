const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

/**
 * Get meal plan for a specific week
 * GET /api/meal-plans/week/:weekStartDate
 */
exports.getMealPlanForWeek = async (req, res) => {
  try {
    const { weekStartDate } = req.params;
    const userId = req.user.id;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weekStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
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
exports.addRecipeToMealPlan = async (req, res) => {
  try {
    const { recipe_id, week_start_date, day_of_week, meal_type } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!recipe_id || !week_start_date || day_of_week === undefined || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipe_id, week_start_date, day_of_week, meal_type'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(week_start_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate day_of_week (0-6)
    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day_of_week. Must be between 0 (Sunday) and 6 (Saturday)'
      });
    }

    // Validate meal_type
    const validMealTypes = ['breakfast', 'lunch', 'dinner'];
    if (!validMealTypes.includes(meal_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal_type. Must be breakfast, lunch, or dinner'
      });
    }

    // Verify recipe exists
    const recipe = await Recipe.findById(recipe_id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
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
exports.updateMealPlanEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipe_id } = req.body;
    const userId = req.user.id;

    // Validate required field
    if (!recipe_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: recipe_id'
      });
    }

    // Verify recipe exists
    const recipe = await Recipe.findById(recipe_id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Update meal plan entry
    const updatedMealPlan = await MealPlan.update(id, userId, { recipe_id });

    if (!updatedMealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan entry not found or you do not have permission to update it'
      });
    }

    // Fetch the full meal plan entry with recipe details
    const fullMealPlan = await MealPlan.findByWeek(userId, updatedMealPlan.week_start_date);
    const updatedEntry = fullMealPlan.find(mp => mp.id === parseInt(id));

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
exports.deleteMealPlanEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete meal plan entry
    const deletedMealPlan = await MealPlan.delete(id, userId);

    if (!deletedMealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan entry not found or you do not have permission to delete it'
      });
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
