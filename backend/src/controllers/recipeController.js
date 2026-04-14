const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const RecipeIngredient = require('../models/RecipeIngredient');
const fs = require('fs');
const path = require('path');

// Create new recipe with image and ingredients
const createRecipe = async (req, res) => {
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
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Recipe image is required'
      });
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
      return res.status(400).json({
        success: false,
        message: 'Invalid ingredients format'
      });
    }

    // Validate ingredients array
    if (!Array.isArray(ingredientList) || ingredientList.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'At least one ingredient is required'
      });
    }

    // Create recipe
    const recipe = await Recipe.create({
      user_id: req.user.id,
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
      recipe
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
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Get ingredients for this recipe
    const ingredients = await RecipeIngredient.findByRecipeId(recipe.id);

    res.json({
      success: true,
      recipe: {
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
const getAllRecipes = async (req, res) => {
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

    const offset = (page - 1) * limit;

    // Build filter parameters
    const filters = {
      category,
      difficulty,
      minRating: minRating ? parseFloat(minRating) : null,
      search,
      sortBy,
      limit: parseInt(limit),
      offset
    };

    const recipes = await Recipe.findAll(filters);

    // Count total for pagination
    // For now, return recipes length as total (simplified)
    // In production, we'd need a separate count query
    const total = recipes.length;

    res.json({
      success: true,
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
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
const getMyRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findByUserId(req.user.id);

    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recipes'
    });
  }
};

// Update recipe
const updateRecipe = async (req, res) => {
  try {
    // Get existing recipe
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      // Clean up uploaded file if recipe not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check ownership
    if (recipe.user_id !== req.user.id) {
      // Clean up uploaded file if not authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this recipe'
      });
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
    const updates = {};
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
        await RecipeIngredient.deleteByRecipeId(req.params.id);

        // Re-create ingredients
        for (const ing of ingredientList) {
          const ingredient = await Ingredient.findOrCreate(ing.name);
          await RecipeIngredient.create({
            recipe_id: req.params.id,
            ingredient_id: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit
          });
        }
      } catch (error) {
        console.error('Error updating ingredients:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid ingredients format'
        });
      }
    }

    // Update recipe
    const updatedRecipe = await Recipe.update(req.params.id, updates);

    res.json({
      success: true,
      recipe: updatedRecipe
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
const deleteRecipe = async (req, res) => {
  try {
    // Get recipe
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check ownership
    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
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
    await Recipe.delete(req.params.id);

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

module.exports = {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  getMyRecipes,
  updateRecipe,
  deleteRecipe
};
