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
}

module.exports = SavedRecipe;
