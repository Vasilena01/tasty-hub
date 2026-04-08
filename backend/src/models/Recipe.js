const db = require('../config/database');

class Recipe {
  // Create new recipe
  static async create({
    user_id,
    title,
    description,
    category,
    difficulty,
    cooking_time,
    servings,
    image_url,
    instructions
  }) {
    const query = `
      INSERT INTO recipes (
        user_id, title, description, category, difficulty,
        cooking_time, servings, image_url, instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      user_id, title, description, category, difficulty,
      cooking_time, servings, image_url, instructions
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Find recipe by ID with creator info
  static async findById(id) {
    const query = `
      SELECT r.*,
             u.username, u.first_name, u.last_name, u.profile_picture_url
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Find all recipes with filters
  static async findAll({ category, difficulty, minRating, search, sortBy, limit, offset }) {
    let query = `
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(category);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(difficulty);
    }

    if (minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(minRating);
    }

    if (search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    // Sorting
    if (sortBy === 'rating') {
      query += ' ORDER BY r.average_rating DESC, r.created_at DESC';
    } else if (sortBy === 'newest') {
      query += ' ORDER BY r.created_at DESC';
    } else if (sortBy === 'quickest') {
      query += ' ORDER BY r.cooking_time ASC';
    } else {
      query += ' ORDER BY r.created_at DESC';
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

  // Find recipes by user
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM recipes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Update recipe
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    paramCount++;
    values.push(id);

    const query = `
      UPDATE recipes
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Delete recipe
  static async delete(id) {
    const query = 'DELETE FROM recipes WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update rating statistics
  static async updateRatingStats(recipeId) {
    const query = `
      UPDATE recipes
      SET average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE recipe_id = $1
      ),
      total_ratings = (
        SELECT COUNT(*) FROM ratings WHERE recipe_id = $1
      )
      WHERE id = $1
      RETURNING average_rating, total_ratings
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows[0];
  }

  // Update saves count
  static async updateSavesCount(recipeId) {
    const query = `
      UPDATE recipes
      SET total_saves = (
        SELECT COUNT(*) FROM saved_recipes WHERE recipe_id = $1
      )
      WHERE id = $1
      RETURNING total_saves
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows[0];
  }
}

module.exports = Recipe;
