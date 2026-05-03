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
    const row = result.rows[0];
    if (!row) return null;
    // Convert numeric strings to numbers for JavaScript
    return {
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      cooking_time: parseInt(row.cooking_time),
      servings: parseInt(row.servings),
      total_ratings: parseInt(row.total_ratings),
      total_saves: parseInt(row.total_saves)
    };
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
    // Convert numeric strings to numbers for JavaScript
    return result.rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      cooking_time: parseInt(row.cooking_time),
      servings: parseInt(row.servings),
      total_ratings: parseInt(row.total_ratings),
      total_saves: parseInt(row.total_saves)
    }));
  }

  // Count all recipes with filters (for pagination)
  static async countAll({ category, difficulty, minRating, search }) {
    let query = `
      SELECT COUNT(*) as total
      FROM recipes r
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

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Find recipes by user
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM recipes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    // Convert numeric strings to numbers for JavaScript
    return result.rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      cooking_time: parseInt(row.cooking_time),
      servings: parseInt(row.servings),
      total_ratings: parseInt(row.total_ratings),
      total_saves: parseInt(row.total_saves)
    }));
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

  // Find recipes by ingredients with fuzzy matching
  static async findByIngredients({ ingredients, category, difficulty, minRating, limit, offset }) {
    // Parse comma-separated ingredients and trim whitespace
    const ingredientList = ingredients
      .split(',')
      .map(ing => ing.trim().toLowerCase())
      .filter(ing => ing.length > 0);

    if (ingredientList.length === 0) {
      return [];
    }

    // Build fuzzy matching conditions for each ingredient
    const ingredientConditions = ingredientList.map((_, index) =>
      `i.name ILIKE $${index + 1}`
    ).join(' OR ');

    let query = `
      WITH matched_recipes AS (
        SELECT
          r.id,
          COUNT(DISTINCT ri.ingredient_id) as match_count,
          ARRAY_AGG(DISTINCT i.name) as matched_ingredient_names,
          ARRAY_AGG(DISTINCT ri.ingredient_id) as matched_ingredient_ids
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ${ingredientConditions}
        GROUP BY r.id
      ),
      all_ingredients AS (
        SELECT
          ri.recipe_id,
          JSON_AGG(JSON_BUILD_OBJECT(
            'id', i.id,
            'name', i.name,
            'quantity', ri.quantity,
            'unit', ri.unit
          )) as ingredients
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        GROUP BY ri.recipe_id
      )
      SELECT
        r.*,
        u.username,
        u.first_name,
        u.last_name,
        mr.match_count,
        mr.matched_ingredient_names,
        mr.matched_ingredient_ids,
        ai.ingredients
      FROM matched_recipes mr
      JOIN recipes r ON mr.id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN all_ingredients ai ON r.id = ai.recipe_id
      WHERE 1=1
    `;

    const values = ingredientList.map(ing => `%${ing}%`);
    let paramCount = ingredientList.length;

    // Apply filters
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

    // Sort by match count (descending), then by rating (descending)
    query += ' ORDER BY mr.match_count DESC, r.average_rating DESC, r.created_at DESC';

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

    // Convert numeric strings to numbers and structure matched ingredients
    return result.rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      cooking_time: parseInt(row.cooking_time),
      servings: parseInt(row.servings),
      total_ratings: parseInt(row.total_ratings),
      total_saves: parseInt(row.total_saves),
      match_count: parseInt(row.match_count),
      matched_ingredients: row.matched_ingredient_names || [],
      matched_ingredient_ids: row.matched_ingredient_ids || [],
      ingredients: row.ingredients || []
    }));
  }

  // Count recipes matching ingredients (for pagination)
  static async countByIngredients({ ingredients, category, difficulty, minRating }) {
    const ingredientList = ingredients
      .split(',')
      .map(ing => ing.trim().toLowerCase())
      .filter(ing => ing.length > 0);

    if (ingredientList.length === 0) {
      return 0;
    }

    const ingredientConditions = ingredientList.map((_, index) =>
      `i.name ILIKE $${index + 1}`
    ).join(' OR ');

    let query = `
      WITH matched_recipes AS (
        SELECT DISTINCT r.id
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ${ingredientConditions}
      )
      SELECT COUNT(*) as total
      FROM matched_recipes mr
      JOIN recipes r ON mr.id = r.id
      WHERE 1=1
    `;

    const values = ingredientList.map(ing => `%${ing}%`);
    let paramCount = ingredientList.length;

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

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Find recipes from followed users
  static async findFromFollowedUsers({ userId, category, difficulty, minRating, search, sortBy, limit, offset }) {
    let query = `
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      JOIN followers f ON r.user_id = f.followed_user_id
      WHERE f.follower_user_id = $1
    `;
    const values = [userId];
    let paramCount = 1;

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
    return result.rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      cooking_time: parseInt(row.cooking_time),
      servings: parseInt(row.servings),
      total_ratings: parseInt(row.total_ratings),
      total_saves: parseInt(row.total_saves)
    }));
  }

  // Count recipes from followed users
  static async countFromFollowedUsers({ userId, category, difficulty, minRating, search }) {
    let query = `
      SELECT COUNT(*) as total
      FROM recipes r
      JOIN followers f ON r.user_id = f.followed_user_id
      WHERE f.follower_user_id = $1
    `;
    const values = [userId];
    let paramCount = 1;

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

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Recipe;
