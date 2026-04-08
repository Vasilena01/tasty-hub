const db = require('../config/database');

class User {
  // Create new user
  static async create({ username, email, password_hash, first_name, last_name }) {
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, profile_picture_url, created_at
    `;
    const values = [username, email, password_hash, first_name, last_name];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  // Update user profile
  static async update(id, { first_name, last_name, profile_picture_url }) {
    const query = `
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          profile_picture_url = COALESCE($3, profile_picture_url)
      WHERE id = $4
      RETURNING id, username, email, first_name, last_name, profile_picture_url, updated_at
    `;
    const values = [first_name, last_name, profile_picture_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, password_hash) {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id
    `;
    const result = await db.query(query, [password_hash, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;
