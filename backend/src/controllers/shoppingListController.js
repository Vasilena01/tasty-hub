const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const ShoppingList = require('../models/ShoppingList');

// Category mapping for ingredient classification
const categoryMap = {
  'Vegetables': ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'lettuce', 'spinach', 'bell pepper', 'cucumber', 'broccoli', 'cabbage', 'celery', 'zucchini', 'eggplant', 'mushroom', 'peas', 'corn', 'green beans'],
  'Proteins': ['chicken', 'beef', 'pork', 'fish', 'tofu', 'eggs', 'turkey', 'lamb', 'shrimp', 'salmon', 'tuna', 'prawns', 'bacon', 'sausage', 'ham'],
  'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'mozzarella', 'parmesan', 'cheddar', 'feta'],
  'Grains': ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'noodles', 'couscous', 'barley', 'bulgur'],
  'Fruits': ['apple', 'banana', 'orange', 'lemon', 'lime', 'berries', 'mango', 'avocado', 'strawberry', 'blueberry', 'pineapple', 'watermelon'],
  'Spices': ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'cinnamon', 'ginger', 'turmeric', 'chili', 'cayenne', 'rosemary', 'cilantro', 'parsley'],
  'Oils': ['olive oil', 'vegetable oil', 'coconut oil', 'sesame oil', 'canola oil', 'sunflower oil'],
  'Condiments': ['soy sauce', 'vinegar', 'ketchup', 'mustard', 'mayo', 'mayonnaise', 'hot sauce', 'worcestershire', 'fish sauce', 'honey', 'maple syrup'],
  'Beverages': ['water', 'juice', 'wine', 'stock', 'broth', 'beer', 'tea', 'coffee'],
};

/**
 * Helper function to determine ingredient category
 */
const getIngredientCategory = (ingredientName) => {
  const lowerName = ingredientName.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
};

/**
 * Helper function to parse quantity string to number
 */
const parseQuantity = (quantity) => {
  if (typeof quantity === 'number') return quantity;
  if (typeof quantity === 'string') {
    const parsed = parseFloat(quantity);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Generate shopping list from weekly meal plan
 * POST /api/shopping-lists/generate/:weekStartDate
 */
exports.generateShoppingList = async (req, res) => {
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

    // Get all meal plans for the user and week
    const mealPlans = await MealPlan.findByWeek(userId, weekStartDate);

    if (mealPlans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No meal plans found for this week. Add recipes to your meal plan first.'
      });
    }

    // Extract unique recipe IDs
    const recipeIds = [...new Set(mealPlans.map(mp => mp.recipe_id))];

    // Get all ingredients for these recipes
    const ingredientsByRecipe = await Promise.all(
      recipeIds.map(recipeId => RecipeIngredient.findByRecipeId(recipeId))
    );

    // Flatten ingredients array
    const allIngredients = ingredientsByRecipe.flat();

    if (allIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No ingredients found in meal plan recipes.'
      });
    }

    // Aggregate duplicate ingredients (same name + unit)
    const aggregated = {};

    allIngredients.forEach(ingredient => {
      const key = `${ingredient.ingredient_name.toLowerCase()}|${(ingredient.unit || '').toLowerCase()}`;

      if (aggregated[key]) {
        aggregated[key].quantity += parseQuantity(ingredient.quantity);
      } else {
        aggregated[key] = {
          ingredient_name: ingredient.ingredient_name,
          quantity: parseQuantity(ingredient.quantity),
          unit: ingredient.unit || '',
          category: getIngredientCategory(ingredient.ingredient_name)
        };
      }
    });

    // Convert aggregated object to array and add user_id and week_start_date
    const shoppingListItems = Object.values(aggregated).map(item => ({
      user_id: userId,
      week_start_date: weekStartDate,
      ingredient_name: item.ingredient_name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      category: item.category
    }));

    // Delete existing shopping list for this week
    await ShoppingList.deleteByWeek(userId, weekStartDate);

    // Bulk insert new shopping list items
    const createdItems = await ShoppingList.createMany(shoppingListItems);

    res.status(201).json({
      success: true,
      message: `Shopping list generated successfully with ${createdItems.length} items`,
      data: {
        itemCount: createdItems.length,
        items: createdItems
      }
    });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating shopping list'
    });
  }
};

/**
 * Get shopping list for a specific week
 * GET /api/shopping-lists/week/:weekStartDate
 */
exports.getShoppingListForWeek = async (req, res) => {
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

    const shoppingList = await ShoppingList.findByWeek(userId, weekStartDate);

    res.status(200).json({
      success: true,
      data: shoppingList
    });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shopping list'
    });
  }
};

/**
 * Toggle item checked status
 * PUT /api/shopping-lists/:id/toggle
 */
exports.toggleItemChecked = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const updatedItem = await ShoppingList.toggleChecked(id, userId);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item status updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item'
    });
  }
};

/**
 * Update shopping list item (edit quantity, unit, name)
 * PUT /api/shopping-lists/:id
 */
exports.updateShoppingListItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { ingredient_name, quantity, unit } = req.body;

    // Build updates object with only provided fields
    const updates = {};
    if (ingredient_name !== undefined) updates.ingredient_name = ingredient_name;
    if (quantity !== undefined) updates.quantity = quantity.toString();
    if (unit !== undefined) updates.unit = unit;

    // Recalculate category if ingredient name changed
    if (ingredient_name) {
      updates.category = getIngredientCategory(ingredient_name);
    }

    const updatedItem = await ShoppingList.update(id, userId, updates);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item'
    });
  }
};

/**
 * Add manual item to shopping list
 * POST /api/shopping-lists
 */
exports.addManualItem = async (req, res) => {
  try {
    const { ingredient_name, quantity, unit, week_start_date } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!ingredient_name || !quantity || !week_start_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ingredient_name, quantity, week_start_date'
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

    // Auto-assign category
    const category = getIngredientCategory(ingredient_name);

    const newItem = await ShoppingList.create({
      user_id: userId,
      week_start_date,
      ingredient_name,
      quantity: quantity.toString(),
      unit: unit || '',
      category
    });

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item'
    });
  }
};

/**
 * Delete single shopping list item
 * DELETE /api/shopping-lists/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedItem = await ShoppingList.delete(id, userId);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: deletedItem
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item'
    });
  }
};

/**
 * Clear all checked items for a week
 * DELETE /api/shopping-lists/week/:weekStartDate/checked
 */
exports.clearCheckedItems = async (req, res) => {
  try {
    const { weekStartDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weekStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    await ShoppingList.deleteChecked(userId, weekStartDate);

    res.status(200).json({
      success: true,
      message: 'Checked items cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing checked items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing checked items'
    });
  }
};

/**
 * Delete entire shopping list for a week (for regeneration)
 * DELETE /api/shopping-lists/week/:weekStartDate
 */
exports.deleteShoppingList = async (req, res) => {
  try {
    const { weekStartDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weekStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    await ShoppingList.deleteByWeek(userId, weekStartDate);

    res.status(200).json({
      success: true,
      message: 'Shopping list deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting shopping list'
    });
  }
};
