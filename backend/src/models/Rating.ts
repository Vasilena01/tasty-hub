import { Pool, QueryResult } from 'pg';
import { IRating, IRatingCreateInput } from '../types/models.types';

const db: Pool = require('../config/database');

class Rating {
  // Create or update rating (upsert)
  static async upsert(data: IRatingCreateInput): Promise<IRating> {
    const query = `
      INSERT INTO ratings (user_id, recipe_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, recipe_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result: QueryResult<IRating> = await db.query(query, [data.user_id, data.recipe_id, data.rating]);
    return result.rows[0];
  }

  // Get user's rating for a recipe
  static async findByUserAndRecipe(userId: number, recipeId: number): Promise<IRating | undefined> {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 AND recipe_id = $2';
    const result: QueryResult<IRating> = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  // Get all ratings for a recipe
  static async findByRecipeId(recipeId: number): Promise<any[]> {
    const query = `
      SELECT r.*, u.username, u.first_name, u.last_name, u.profile_picture_url
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.recipe_id = $1
      ORDER BY r.created_at DESC
    `;
    const result: QueryResult = await db.query(query, [recipeId]);
    return result.rows;
  }

  // Get all ratings by user
  static async findByUserId(userId: number): Promise<any[]> {
    const query = `
      SELECT r.*, rec.title as recipe_title
      FROM ratings r
      JOIN recipes rec ON r.recipe_id = rec.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result: QueryResult = await db.query(query, [userId]);
    return result.rows;
  }

  // Delete rating
  static async delete(userId: number, recipeId: number): Promise<IRating | undefined> {
    const query = 'DELETE FROM ratings WHERE user_id = $1 AND recipe_id = $2 RETURNING *';
    const result: QueryResult<IRating> = await db.query(query, [userId, recipeId]);
    return result.rows[0];
  }

  /**
   * Get average rating and count for a recipe
   * @param recipeId - Recipe ID
   * @returns { averageRating, ratingCount }
   */
  static async getRecipeRatings(recipeId: number): Promise<{ averageRating: string; ratingCount: number }> {
    const result: QueryResult = await db.query(
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
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @param ratingValue - Rating value (1-5)
   * @returns Created/updated rating
   */
  static async submitRating(userId: number, recipeId: number, ratingValue: number): Promise<IRating> {
    return await this.upsert({ user_id: userId, recipe_id: recipeId, rating: ratingValue });
  }

  /**
   * Get user's rating for a recipe (alternative naming)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @returns User's rating or null
   */
  static async getUserRating(userId: number, recipeId: number): Promise<IRating | undefined> {
    return await this.findByUserAndRecipe(userId, recipeId);
  }

  /**
   * Delete a rating (alternative naming)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @returns Success status
   */
  static async deleteRating(userId: number, recipeId: number): Promise<boolean> {
    const result = await this.delete(userId, recipeId);
    return !!result;
  }
}

export default Rating;
