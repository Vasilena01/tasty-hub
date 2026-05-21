import { Pool, QueryResult } from 'pg';
import { IMealPlan, IMealPlanCreateInput } from '../types/models.types';

import db from '../config/database';

class MealPlan {
  // Add recipe to meal plan (upsert - replaces existing if slot is occupied)
  static async create(data: IMealPlanCreateInput): Promise<IMealPlan> {
    const query = `
      INSERT INTO meal_plans (user_id, recipe_id, week_start_date, day_of_week, meal_type)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, week_start_date, day_of_week, meal_type)
      DO UPDATE SET recipe_id = $2
      RETURNING *
    `;
    const result: QueryResult<IMealPlan> = await db.query(query, [data.user_id, data.recipe_id, data.week_start_date, data.day_of_week, data.meal_type]);
    return result.rows[0];
  }

  // Get meal plan for a week
  static async findByWeek(userId: number, weekStartDate: Date): Promise<any[]> {
    const query = `
      SELECT mp.*, r.title, r.image_url, r.cooking_time, r.difficulty
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.week_start_date = $2
      ORDER BY mp.day_of_week, mp.meal_type
    `;
    const result: QueryResult = await db.query(query, [userId, weekStartDate]);
    return result.rows;
  }

  // Get all recipes used in a week's meal plan
  static async getRecipesForWeek(userId: number, weekStartDate: Date): Promise<any[]> {
    const query = `
      SELECT DISTINCT r.*
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.week_start_date = $2
    `;
    const result: QueryResult = await db.query(query, [userId, weekStartDate]);
    return result.rows;
  }

  // Update meal plan entry
  static async update(id: number, userId: number, data: { recipe_id: number }): Promise<IMealPlan | undefined> {
    const query = `
      UPDATE meal_plans
      SET recipe_id = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result: QueryResult<IMealPlan> = await db.query(query, [data.recipe_id, id, userId]);
    return result.rows[0];
  }

  // Delete meal plan entry
  static async delete(id: number, userId: number): Promise<IMealPlan | undefined> {
    const query = 'DELETE FROM meal_plans WHERE id = $1 AND user_id = $2 RETURNING *';
    const result: QueryResult<IMealPlan> = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Delete all meal plans for a week
  static async deleteByWeek(userId: number, weekStartDate: Date): Promise<void> {
    const query = 'DELETE FROM meal_plans WHERE user_id = $1 AND week_start_date = $2';
    await db.query(query, [userId, weekStartDate]);
  }
}

export default MealPlan;
