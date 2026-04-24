const db = require('../config/database');

class SavedRecipe {
  // Save a recipe
  static async create({ user_id, recipe_id }) {
    const query = `
      INSERT INTO saved_recipes (user_id, recipe_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, recipe_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query(query, [user_id, recipe_id]);
    return result.rows[0];
  }

  // Get user's saved recipes
  static async findByUserId(userId, { sortBy, category, limit, offset } = {}) {
    let query = `
      SELECT sr.*, r.*, u.username, u.first_name, u.last_name
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE sr.user_id = $1
    `;
    const values = [userId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(category);
    }

    // Sorting
    if (sortBy === 'rating') {
      query += ' ORDER BY r.average_rating DESC';
    } else if (sortBy === 'quickest') {
      query += ' ORDER BY r.cooking_time ASC';
    } else {
      query += ' ORDER BY sr.saved_at DESC'; // Default: recently saved
    }

    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(limit);
    }

    if (offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(offset);
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  // Check if user saved a recipe
  static async exists(userId, recipeId) {
    const query = 'SELECT * FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2';
    const result = await db.query(query, [userId, recipeId]);
    return result.rows.length > 0;
  }

  // Unsave a recipe
  static async delete(userId, recipeId) {
    const query = 'DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2 RETURNING *';
    const result = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  // Get count of saves for a recipe
  static async countByRecipeId(recipeId) {
    const query = 'SELECT COUNT(*) as count FROM saved_recipes WHERE recipe_id = $1';
    const result = await db.query(query, [recipeId]);
    return parseInt(result.rows[0].count);
  }

  // Convenience methods to match plan naming

  /**
   * Save a recipe (alternative naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<object>} Created saved recipe
   */
  static async saveRecipe(userId, recipeId) {
    const result = await this.create({ user_id: userId, recipe_id: recipeId });
    if (!result) {
      throw new Error('Recipe already saved');
    }
    return result;
  }

  /**
   * Unsave a recipe (alternative naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<boolean>} Success status
   */
  static async unsaveRecipe(userId, recipeId) {
    const result = await this.delete(userId, recipeId);
    return !!result;
  }

  /**
   * Get user's saved recipes (alternative naming with enhanced query)
   * @param {number} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<array>} Array of saved recipes
   */
  static async getUserSavedRecipes(userId, options = {}) {
    return await this.findByUserId(userId, options);
  }

  /**
   * Check if saved (alternative naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<boolean>} True if saved
   */
  static async isSaved(userId, recipeId) {
    return await this.exists(userId, recipeId);
  }

  /**
   * Get user's saved recipe count
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count
   */
  static async getUserSavedCount(userId) {
    const query = 'SELECT COUNT(*) as count FROM saved_recipes WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get recipe's save count (alternative naming)
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<number>} Count
   */
  static async getRecipeSaveCount(recipeId) {
    return await this.countByRecipeId(recipeId);
  }
}

module.exports = SavedRecipe;
