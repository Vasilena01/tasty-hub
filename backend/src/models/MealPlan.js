const db = require('../config/database');

class MealPlan {
  // Add recipe to meal plan (upsert - replaces existing if slot is occupied)
  static async create({ user_id, recipe_id, week_start_date, day_of_week, meal_type }) {
    const query = `
      INSERT INTO meal_plans (user_id, recipe_id, week_start_date, day_of_week, meal_type)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, week_start_date, day_of_week, meal_type)
      DO UPDATE SET recipe_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [user_id, recipe_id, week_start_date, day_of_week, meal_type]);
    return result.rows[0];
  }

  // Get meal plan for a week
  static async findByWeek(userId, weekStartDate) {
    const query = `
      SELECT mp.*, r.title, r.image_url, r.cooking_time, r.difficulty
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.week_start_date = $2
      ORDER BY mp.day_of_week, mp.meal_type
    `;
    const result = await db.query(query, [userId, weekStartDate]);
    return result.rows;
  }

  // Get all recipes used in a week's meal plan
  static async getRecipesForWeek(userId, weekStartDate) {
    const query = `
      SELECT DISTINCT r.*
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.week_start_date = $2
    `;
    const result = await db.query(query, [userId, weekStartDate]);
    return result.rows;
  }

  // Update meal plan entry
  static async update(id, userId, { recipe_id }) {
    const query = `
      UPDATE meal_plans
      SET recipe_id = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await db.query(query, [recipe_id, id, userId]);
    return result.rows[0];
  }

  // Delete meal plan entry
  static async delete(id, userId) {
    const query = 'DELETE FROM meal_plans WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Delete all meal plans for a week
  static async deleteByWeek(userId, weekStartDate) {
    const query = 'DELETE FROM meal_plans WHERE user_id = $1 AND week_start_date = $2';
    await db.query(query, [userId, weekStartDate]);
  }
}

module.exports = MealPlan;
