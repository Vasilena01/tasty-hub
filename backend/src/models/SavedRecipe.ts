import { Pool, QueryResult } from 'pg';
import { ISavedRecipe, ISavedRecipeCreateInput } from '../types/models.types';

const db: Pool = require('../config/database');

interface SavedRecipeQueryOptions {
  sortBy?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

class SavedRecipe {
  // Save a recipe
  static async create(data: ISavedRecipeCreateInput): Promise<ISavedRecipe | undefined> {
    const query = `
      INSERT INTO saved_recipes (user_id, recipe_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, recipe_id) DO NOTHING
      RETURNING *
    `;
    const result: QueryResult<ISavedRecipe> = await db.query(query, [data.user_id, data.recipe_id]);
    return result.rows[0];
  }

  // Get user's saved recipes
  static async findByUserId(userId: number, options: SavedRecipeQueryOptions = {}): Promise<any[]> {
    let query = `
      SELECT sr.*, r.*, u.username, u.first_name, u.last_name
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE sr.user_id = $1
    `;
    const values: any[] = [userId];
    let paramCount = 1;

    if (options.category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      values.push(options.category);
    }

    // Sorting
    if (options.sortBy === 'rating') {
      query += ' ORDER BY r.average_rating DESC';
    } else if (options.sortBy === 'quickest') {
      query += ' ORDER BY r.cooking_time ASC';
    } else {
      query += ' ORDER BY sr.saved_at DESC'; // Default: recently saved
    }

    if (options.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(options.limit);
    }

    if (options.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(options.offset);
    }

    const result: QueryResult = await db.query(query, values);
    return result.rows;
  }

  // Check if user saved a recipe
  static async exists(userId: number, recipeId: number): Promise<boolean> {
    const query = 'SELECT * FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2';
    const result: QueryResult = await db.query(query, [userId, recipeId]);
    return result.rows.length > 0;
  }

  // Unsave a recipe
  static async delete(userId: number, recipeId: number): Promise<ISavedRecipe | undefined> {
    const query = 'DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2 RETURNING *';
    const result: QueryResult<ISavedRecipe> = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  // Get count of saves for a recipe
  static async countByRecipeId(recipeId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM saved_recipes WHERE recipe_id = $1';
    const result: QueryResult = await db.query(query, [recipeId]);
    return parseInt(result.rows[0].count);
  }

  // Convenience methods to match plan naming

  /**
   * Save a recipe (alternative naming)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @returns Created saved recipe
   */
  static async saveRecipe(userId: number, recipeId: number): Promise<ISavedRecipe> {
    const result = await this.create({ user_id: userId, recipe_id: recipeId });
    if (!result) {
      throw new Error('Recipe already saved');
    }
    return result;
  }

  /**
   * Unsave a recipe (alternative naming)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @returns Success status
   */
  static async unsaveRecipe(userId: number, recipeId: number): Promise<boolean> {
    const result = await this.delete(userId, recipeId);
    return !!result;
  }

  /**
   * Get user's saved recipes (alternative naming with enhanced query)
   * @param userId - User ID
   * @param options - Query options
   * @returns Array of saved recipes
   */
  static async getUserSavedRecipes(userId: number, options: SavedRecipeQueryOptions = {}): Promise<any[]> {
    return await this.findByUserId(userId, options);
  }

  /**
   * Check if saved (alternative naming)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @returns True if saved
   */
  static async isSaved(userId: number, recipeId: number): Promise<boolean> {
    return await this.exists(userId, recipeId);
  }

  /**
   * Get user's saved recipe count
   * @param userId - User ID
   * @returns Count
   */
  static async getUserSavedCount(userId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM saved_recipes WHERE user_id = $1';
    const result: QueryResult = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get recipe's save count (alternative naming)
   * @param recipeId - Recipe ID
   * @returns Count
   */
  static async getRecipeSaveCount(recipeId: number): Promise<number> {
    return await this.countByRecipeId(recipeId);
  }
}

export default SavedRecipe;
