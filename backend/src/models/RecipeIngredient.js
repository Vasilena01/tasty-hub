const db = require('../config/database');

class RecipeIngredient {
  // Add ingredient to recipe
  static async create({ recipe_id, ingredient_id, quantity, unit }) {
    const query = `
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [recipe_id, ingredient_id, quantity, unit]);
    return result.rows[0];
  }

  // Get all ingredients for a recipe
  static async findByRecipeId(recipeId) {
    const query = `
      SELECT ri.*, i.name as ingredient_name
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = $1
      ORDER BY ri.id
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows;
  }

  // Delete all ingredients for a recipe
  static async deleteByRecipeId(recipeId) {
    const query = 'DELETE FROM recipe_ingredients WHERE recipe_id = $1';
    await db.query(query, [recipeId]);
  }

  // Delete specific ingredient from recipe
  static async delete(id) {
    const query = 'DELETE FROM recipe_ingredients WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Find recipes by ingredients (recipes containing ALL specified ingredients)
  static async findRecipesByIngredients(ingredientIds) {
    const query = `
      SELECT r.*, u.username, u.first_name, u.last_name,
             COUNT(DISTINCT ri.ingredient_id) as matched_ingredients
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      WHERE ri.ingredient_id = ANY($1)
      GROUP BY r.id, u.id
      HAVING COUNT(DISTINCT ri.ingredient_id) = $2
      ORDER BY r.average_rating DESC
    `;
    const result = await db.query(query, [ingredientIds, ingredientIds.length]);
    return result.rows;
  }
}

module.exports = RecipeIngredient;
