import { Response } from 'express';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import RecipeIngredient from '../models/RecipeIngredient';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

// Create new recipe with image and ingredients
const createRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      cooking_time,
      servings,
      instructions,
      ingredients
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || !cooking_time || !servings || !instructions) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Check if image was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Recipe image is required'
      });
      return;
    }

    // Build image URL (relative path)
    const image_url = `/uploads/recipes/${req.file.filename}`;

    // Parse ingredients JSON string
    let ingredientList;
    try {
      ingredientList = JSON.parse(ingredients);
    } catch (error) {
      // Clean up uploaded file if JSON parsing fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: 'Invalid ingredients format'
      });
      return;
    }

    // Validate ingredients array
    if (!Array.isArray(ingredientList) || ingredientList.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: 'At least one ingredient is required'
      });
      return;
    }

    // Create recipe
    const recipe = await Recipe.create({
      user_id: req.user!.id,
      title,
      description,
      category,
      difficulty,
      cooking_time: parseInt(cooking_time),
      servings: parseInt(servings),
      image_url,
      instructions
    });

    // Insert ingredients
    for (const ing of ingredientList) {
      // Find or create ingredient in master table
      const ingredient = await Ingredient.findOrCreate(ing.name);

      // Create recipe-ingredient association
      await RecipeIngredient.create({
        recipe_id: recipe.id,
        ingredient_id: ingredient.id,
        quantity: ing.quantity,
        unit: ing.unit
      });
    }

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating recipe'
    });
  }
};

// Get recipe by ID with ingredients
const getRecipeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findById(parseInt(req.params.id as string));

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Get ingredients for this recipe
    const ingredients = await RecipeIngredient.findByRecipeId(recipe.id);

    res.json({
      success: true,
      data: {
        ...recipe,
        ingredients
      }
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recipe'
    });
  }
};

// Get all recipes with filters and pagination
const getAllRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      difficulty,
      minRating,
      search,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build filter parameters
    const filters = {
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      search: search as string | undefined,
      sortBy: sortBy as string | undefined,
      limit: parseInt(limit as string),
      offset
    };

    const recipes = await Recipe.findAll(filters);

    // Count total for pagination
    const total = await Recipe.countAll({
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      search: search as string | undefined
    });

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recipes'
    });
  }
};

// Get current user's recipes
const getMyRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recipes = await Recipe.findByUserId(req.user!.id);

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recipes'
    });
  }
};

// Get recipes by user ID
const getRecipesByUserId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const recipes = await Recipe.findByUserId(parseInt(userId as string));

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user recipes'
    });
  }
};

// Update recipe
const updateRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get existing recipe
    const recipe = await Recipe.findById(parseInt(req.params.id as string));

    if (!recipe) {
      // Clean up uploaded file if recipe not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Check ownership
    if (recipe.user_id !== req.user!.id) {
      // Clean up uploaded file if not authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(403).json({
        success: false,
        message: 'Not authorized to edit this recipe'
      });
      return;
    }

    const {
      title,
      description,
      category,
      difficulty,
      cooking_time,
      servings,
      instructions,
      ingredients
    } = req.body;

    // Build updates object (only include provided fields)
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (cooking_time !== undefined) updates.cooking_time = parseInt(cooking_time);
    if (servings !== undefined) updates.servings = parseInt(servings);
    if (instructions !== undefined) updates.instructions = instructions;

    // Handle image update
    if (req.file) {
      updates.image_url = `/uploads/recipes/${req.file.filename}`;

      // Delete old image file
      const oldImagePath = path.join(__dirname, '../../', recipe.image_url);
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Handle ingredients update
    if (ingredients) {
      try {
        const ingredientList = JSON.parse(ingredients);

        // Delete existing ingredients
        await RecipeIngredient.deleteByRecipeId(parseInt(req.params.id as string));

        // Re-create ingredients
        for (const ing of ingredientList) {
          const ingredient = await Ingredient.findOrCreate(ing.name);
          await RecipeIngredient.create({
            recipe_id: parseInt(req.params.id as string),
            ingredient_id: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit
          });
        }
      } catch (error) {
        console.error('Error updating ingredients:', error);
        res.status(400).json({
          success: false,
          message: 'Invalid ingredients format'
        });
        return;
      }
    }

    // Update recipe
    const updatedRecipe = await Recipe.update(parseInt(req.params.id as string), updates);

    res.json({
      success: true,
      data: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating recipe'
    });
  }
};

// Delete recipe
const deleteRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get recipe
    const recipe = await Recipe.findById(parseInt(req.params.id as string));

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Check ownership
    if (recipe.user_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
      return;
    }

    // Delete image file from filesystem
    const imagePath = path.join(__dirname, '../../', recipe.image_url);
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
      // Continue with recipe deletion even if file deletion fails
    }

    // Delete recipe (cascade deletes will handle related records)
    await Recipe.delete(parseInt(req.params.id as string));

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting recipe'
    });
  }
};

// Search recipes by ingredients
const searchByIngredients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      ingredients,
      category,
      difficulty,
      minRating,
      page = 1,
      limit = 12
    } = req.query;

    // Validate ingredients parameter
    if (!ingredients || !(ingredients as string).trim()) {
      res.status(400).json({
        success: false,
        message: 'Ingredients parameter is required'
      });
      return;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build filter parameters
    const filters = {
      ingredients: ingredients as string,
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      limit: parseInt(limit as string),
      offset
    };

    const recipes = await Recipe.findByIngredients(filters);

    // Count total for pagination
    const total = await Recipe.countByIngredients({
      ingredients: ingredients as string,
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined
    });

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Search by ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching recipes by ingredients'
    });
  }
};

// Get recipes from followed users
const getFollowingRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      difficulty,
      minRating,
      search,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build filter parameters
    const filters = {
      userId: req.user!.id,
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      search: search as string | undefined,
      sortBy: sortBy as string | undefined,
      limit: parseInt(limit as string),
      offset
    };

    const recipes = await Recipe.findFromFollowedUsers(filters);

    // Count total for pagination
    const total = await Recipe.countFromFollowedUsers({
      userId: req.user!.id,
      category: category as string | undefined,
      difficulty: difficulty as string | undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      search: search as string | undefined
    });

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get following recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching following recipes'
    });
  }
};

export {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  getMyRecipes,
  getRecipesByUserId,
  getFollowingRecipes,
  updateRecipe,
  deleteRecipe,
  searchByIngredients
};
