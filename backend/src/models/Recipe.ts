import { Pool, QueryResult } from 'pg';
import { IRecipe, IRecipeCreateInput, IRecipeUpdateInput } from '../types/models.types';
import db from '../config/database';

interface RecipeQueryFilters {
  category?: string;
  difficulty?: string;
  minRating?: number;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

interface IngredientSearchFilters {
  ingredients: string;
  category?: string;
  difficulty?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}

class Recipe {
  // Create new recipe
  static async create(data: IRecipeCreateInput): Promise<IRecipe> {
    const query = `
      INSERT INTO recipes (
        user_id, title, description, category, difficulty,
        cooking_time, servings, image_url, instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.user_id, data.title, data.description, data.category, data.difficulty,
      data.cooking_time, data.servings, data.image_url, data.instructions
    ];
    const result: QueryResult<IRecipe> = await db.query(query, values);
    return result.rows[0];
  }

  // Find recipe by ID with creator info
  static async findById(id: number): Promise<any | null> {
    const query = `
      SELECT r.*,
             u.username, u.first_name, u.last_name, u.profile_picture_url
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    const result: QueryResult = await db.query(query, [id]);
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
  static async findAll(filters: RecipeQueryFilters): Promise<any[]> {
    let query = `
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    // Sorting
    if (filters.sortBy === 'rating') {
      query += ' ORDER BY r.average_rating DESC, r.created_at DESC';
    } else if (filters.sortBy === 'newest') {
      query += ' ORDER BY r.created_at DESC';
    } else if (filters.sortBy === 'quickest') {
      query += ' ORDER BY r.cooking_time ASC';
    } else {
      query += ' ORDER BY r.created_at DESC';
    }

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result: QueryResult = await db.query(query, values);
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
  static async countAll(filters: RecipeQueryFilters): Promise<number> {
    let query = `
      SELECT COUNT(*) as total
      FROM recipes r
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    const result: QueryResult = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Find recipes by user
  static async findByUserId(userId: number): Promise<any[]> {
    const query = `
      SELECT * FROM recipes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result: QueryResult = await db.query(query, [userId]);
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
  static async update(id: number, updates: IRecipeUpdateInput): Promise<IRecipe | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if ((updates as any)[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push((updates as any)[key]);
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

    const result: QueryResult<IRecipe> = await db.query(query, values);
    return result.rows[0];
  }

  // Delete recipe
  static async delete(id: number): Promise<IRecipe | undefined> {
    const query = 'DELETE FROM recipes WHERE id = $1 RETURNING id';
    const result: QueryResult<IRecipe> = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update rating statistics
  static async updateRatingStats(recipeId: number): Promise<any> {
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
    const result: QueryResult = await db.query(query, [recipeId]);
    return result.rows[0];
  }

  // Update saves count
  static async updateSavesCount(recipeId: number): Promise<any> {
    const query = `
      UPDATE recipes
      SET total_saves = (
        SELECT COUNT(*) FROM saved_recipes WHERE recipe_id = $1
      )
      WHERE id = $1
      RETURNING total_saves
    `;
    const result: QueryResult = await db.query(query, [recipeId]);
    return result.rows[0];
  }

  // Find recipes by ingredients with fuzzy matching
  static async findByIngredients(filters: IngredientSearchFilters): Promise<any[]> {
    // Parse comma-separated ingredients and trim whitespace
    const ingredientList = filters.ingredients
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

    const values: any[] = ingredientList.map(ing => `%${ing}%`);
    let paramCount = ingredientList.length;

    // Apply filters
    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    // Sort by match count (descending), then by rating (descending)
    query += ' ORDER BY mr.match_count DESC, r.average_rating DESC, r.created_at DESC';

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result: QueryResult = await db.query(query, values);

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
  static async countByIngredients(filters: IngredientSearchFilters): Promise<number> {
    const ingredientList = filters.ingredients
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

    const values: any[] = ingredientList.map(ing => `%${ing}%`);
    let paramCount = ingredientList.length;

    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    const result: QueryResult = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Find recipes from followed users
  static async findFromFollowedUsers(filters: RecipeQueryFilters & { userId: number }): Promise<any[]> {
    let query = `
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      JOIN followers f ON r.user_id = f.followed_user_id
      WHERE f.follower_user_id = $1
    `;
    const values: any[] = [filters.userId];
    let paramCount = 1;

    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    // Sorting
    if (filters.sortBy === 'rating') {
      query += ' ORDER BY r.average_rating DESC, r.created_at DESC';
    } else if (filters.sortBy === 'newest') {
      query += ' ORDER BY r.created_at DESC';
    } else if (filters.sortBy === 'quickest') {
      query += ' ORDER BY r.cooking_time ASC';
    } else {
      query += ' ORDER BY r.created_at DESC';
    }

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result: QueryResult = await db.query(query, values);
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
  static async countFromFollowedUsers(filters: RecipeQueryFilters & { userId: number }): Promise<number> {
    let query = `
      SELECT COUNT(*) as total
      FROM recipes r
      JOIN followers f ON r.user_id = f.followed_user_id
      WHERE f.follower_user_id = $1
    `;
    const values: any[] = [filters.userId];
    let paramCount = 1;

    if (filters.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      values.push(filters.difficulty);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.average_rating >= $${paramCount}`;
      values.push(filters.minRating);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    const result: QueryResult = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

export default Recipe;
