import { Response } from 'express';
import SavedRecipe from '../models/SavedRecipe';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiResponse } from '../types/api.types';
import { ISavedRecipe } from '../types/models.types';

// Helper to extract string from params
const getParamAsString = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

interface SavedRecipesData {
  recipes: any[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * @route   POST /api/saved-recipes/:recipeId
 * @desc    Save a recipe
 * @access  Private
 */
const saveRecipe = async (
  req: AuthRequest,
  res: Response<ApiResponse<ISavedRecipe>>
): Promise<void> => {
  try {
    const recipeId = getParamAsString(req.params.recipeId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Check if already saved
    const alreadySaved = await SavedRecipe.isSaved(userId, parseInt(recipeId, 10));
    if (alreadySaved) {
      // Return success if already saved (idempotent)
      res.status(200).json({
        success: true,
        message: 'Recipe already saved'
      });
      return;
    }

    // Save recipe
    const savedRecipe = await SavedRecipe.saveRecipe(userId, parseInt(recipeId, 10));

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
const getSavedRecipes = async (
  req: AuthRequest,
  res: Response<ApiResponse<SavedRecipesData>>
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { sortBy, category, limit = '50', offset = '0' } = req.query;

    // Get saved recipes with options
    const savedRecipes = await SavedRecipe.getUserSavedRecipes(userId, {
      sortBy: sortBy as string,
      category: category as string,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10)
    });

    // Get total count
    const totalCount = await SavedRecipe.getUserSavedCount(userId);

    res.status(200).json({
      success: true,
      data: {
        recipes: savedRecipes,
        total: totalCount,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
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
const unsaveRecipe = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const recipeId = getParamAsString(req.params.recipeId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const deleted = await SavedRecipe.unsaveRecipe(userId, parseInt(recipeId, 10));

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Saved recipe not found'
      });
      return;
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
const checkSaved = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ isSaved: boolean }>>
): Promise<void> => {
  try {
    const recipeId = getParamAsString(req.params.recipeId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const isSaved = await SavedRecipe.isSaved(userId, parseInt(recipeId, 10));

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

export { saveRecipe, getSavedRecipes, unsaveRecipe, checkSaved };
