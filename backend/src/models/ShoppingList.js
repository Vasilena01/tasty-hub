const db = require('../config/database');

class ShoppingList {
  // Create shopping list item
  static async create({ user_id, week_start_date, ingredient_name, quantity, unit, category }) {
    const query = `
      INSERT INTO shopping_lists (user_id, week_start_date, ingredient_name, quantity, unit, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [user_id, week_start_date, ingredient_name, quantity, unit, category]);
    return result.rows[0];
  }

  // Bulk create shopping list items
  static async createMany(items) {
    if (items.length === 0) return [];

    const values = [];
    const placeholders = [];

    items.forEach((item, index) => {
      const base = index * 6;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
      values.push(
        item.user_id,
        item.week_start_date,
        item.ingredient_name,
        item.quantity,
        item.unit,
        item.category
      );
    });

    const query = `
      INSERT INTO shopping_lists (user_id, week_start_date, ingredient_name, quantity, unit, category)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows;
  }

  // Get shopping list for a week
  static async findByWeek(userId, weekStartDate) {
    const query = `
      SELECT * FROM shopping_lists
      WHERE user_id = $1 AND week_start_date = $2
      ORDER BY category, ingredient_name
    `;
    const result = await db.query(query, [userId, weekStartDate]);
    return result.rows;
  }

  // Update shopping list item
  static async update(id, userId, updates) {
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
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE shopping_lists
      SET ${fields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Toggle item checked status
  static async toggleChecked(id, userId) {
    const query = `
      UPDATE shopping_lists
      SET is_checked = NOT is_checked
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Delete shopping list for a week
  static async deleteByWeek(userId, weekStartDate) {
    const query = 'DELETE FROM shopping_lists WHERE user_id = $1 AND week_start_date = $2';
    await db.query(query, [userId, weekStartDate]);
  }

  // Delete single item
  static async delete(id, userId) {
    const query = 'DELETE FROM shopping_lists WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Delete checked items
  static async deleteChecked(userId, weekStartDate) {
    const query = 'DELETE FROM shopping_lists WHERE user_id = $1 AND week_start_date = $2 AND is_checked = TRUE';
    await db.query(query, [userId, weekStartDate]);
  }
}

module.exports = ShoppingList;
