const db = require('../config/database');

class Follower {
  // Follow a user
  static async create({ follower_user_id, followed_user_id }) {
    const query = `
      INSERT INTO followers (follower_user_id, followed_user_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_user_id, followed_user_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query(query, [follower_user_id, followed_user_id]);
    return result.rows[0];
  }

  // Get user's followers
  static async getFollowers(userId) {
    const query = `
      SELECT f.*, u.username, u.first_name, u.last_name, u.profile_picture_url,
             (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as recipe_count
      FROM followers f
      JOIN users u ON f.follower_user_id = u.id
      WHERE f.followed_user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Get users that a user is following
  static async getFollowing(userId) {
    const query = `
      SELECT f.*, u.username, u.first_name, u.last_name, u.profile_picture_url,
             (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as recipe_count
      FROM followers f
      JOIN users u ON f.followed_user_id = u.id
      WHERE f.follower_user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Get follower IDs (for notification purposes)
  static async getFollowerIds(userId) {
    const query = 'SELECT follower_user_id FROM followers WHERE followed_user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.follower_user_id);
  }

  // Check if user is following another user
  static async isFollowing(followerUserId, followedUserId) {
    const query = 'SELECT * FROM followers WHERE follower_user_id = $1 AND followed_user_id = $2';
    const result = await db.query(query, [followerUserId, followedUserId]);
    return result.rows.length > 0;
  }

  // Get follower and following counts
  static async getCounts(userId) {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM followers WHERE followed_user_id = $1) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_user_id = $1) as following_count
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  // Unfollow a user
  static async delete(followerUserId, followedUserId) {
    const query = 'DELETE FROM followers WHERE follower_user_id = $1 AND followed_user_id = $2 RETURNING *';
    const result = await db.query(query, [followerUserId, followedUserId]);
    return result.rows[0];
  }
}

module.exports = Follower;
