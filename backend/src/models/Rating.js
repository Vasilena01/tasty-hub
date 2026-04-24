const db = require('../config/database');

class Rating {
  // Create or update rating (upsert)
  static async upsert({ user_id, recipe_id, rating }) {
    const query = `
      INSERT INTO ratings (user_id, recipe_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, recipe_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await db.query(query, [user_id, recipe_id, rating]);
    return result.rows[0];
  }

  // Get user's rating for a recipe
  static async findByUserAndRecipe(userId, recipeId) {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 AND recipe_id = $2';
    const result = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  // Get all ratings for a recipe
  static async findByRecipeId(recipeId) {
    const query = `
      SELECT r.*, u.username, u.first_name, u.last_name, u.profile_picture_url
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.recipe_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows;
  }

  // Get all ratings by user
  static async findByUserId(userId) {
    const query = `
      SELECT r.*, rec.title as recipe_title
      FROM ratings r
      JOIN recipes rec ON r.recipe_id = rec.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Delete rating
  static async delete(userId, recipeId) {
    const query = 'DELETE FROM ratings WHERE user_id = $1 AND recipe_id = $2 RETURNING *';
    const result = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  /**
   * Get average rating and count for a recipe
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<object>} { averageRating, ratingCount }
   */
  static async getRecipeRatings(recipeId) {
    const result = await db.query(
      `SELECT
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as rating_count
       FROM ratings
       WHERE recipe_id = $1`,
      [recipeId]
    );

    const row = result.rows[0];
    return {
      averageRating: parseFloat(row.average_rating).toFixed(1),
      ratingCount: parseInt(row.rating_count)
    };
  }

  /**
   * Submit or update a rating (alternative to upsert with better naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @param {number} ratingValue - Rating value (1-5)
   * @returns {Promise<object>} Created/updated rating
   */
  static async submitRating(userId, recipeId, ratingValue) {
    return await this.upsert({ user_id: userId, recipe_id: recipeId, rating: ratingValue });
  }

  /**
   * Get user's rating for a recipe (alternative naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<object|null>} User's rating or null
   */
  static async getUserRating(userId, recipeId) {
    return await this.findByUserAndRecipe(userId, recipeId);
  }

  /**
   * Delete a rating (alternative naming)
   * @param {number} userId - User ID
   * @param {number} recipeId - Recipe ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteRating(userId, recipeId) {
    const result = await this.delete(userId, recipeId);
    return !!result;
  }
}

module.exports = Rating;
