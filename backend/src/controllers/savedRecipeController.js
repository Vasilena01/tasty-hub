const SavedRecipe = require('../models/SavedRecipe');

/**
 * @route   POST /api/saved-recipes/:recipeId
 * @desc    Save a recipe
 * @access  Private
 */
exports.saveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Check if already saved
    const alreadySaved = await SavedRecipe.isSaved(userId, recipeId);
    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Recipe already saved'
      });
    }

    // Save recipe
    const savedRecipe = await SavedRecipe.saveRecipe(userId, recipeId);

    res.status(201).json({
      success: true,
      message: 'Recipe saved successfully',
      data: savedRecipe
    });
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving recipe'
    });
  }
};

/**
 * @route   GET /api/saved-recipes
 * @desc    Get user's saved recipes
 * @access  Private
 */
exports.getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy, category, limit = 50, offset = 0 } = req.query;

    // Get saved recipes with options
    const savedRecipes = await SavedRecipe.getUserSavedRecipes(userId, {
      sortBy,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count
    const totalCount = await SavedRecipe.getUserSavedCount(userId);

    res.status(200).json({
      success: true,
      data: {
        recipes: savedRecipes,
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved recipes'
    });
  }
};

/**
 * @route   DELETE /api/saved-recipes/:recipeId
 * @desc    Unsave a recipe
 * @access  Private
 */
exports.unsaveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const deleted = await SavedRecipe.unsaveRecipe(userId, recipeId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved recipe not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recipe unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsaving recipe'
    });
  }
};

/**
 * @route   GET /api/saved-recipes/check/:recipeId
 * @desc    Check if user has saved a recipe
 * @access  Private
 */
exports.checkSaved = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const isSaved = await SavedRecipe.isSaved(userId, recipeId);

    res.status(200).json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking saved status'
    });
  }
};
