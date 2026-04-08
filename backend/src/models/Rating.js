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
}

module.exports = Rating;
