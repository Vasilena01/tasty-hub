const db = require('../config/database');

class Notification {
  // Create notification
  static async create({ user_id, sender_user_id, type, recipe_id, message }) {
    const query = `
      INSERT INTO notifications (user_id, sender_user_id, type, recipe_id, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [user_id, sender_user_id, type, recipe_id, message]);
    return result.rows[0];
  }

  // Create multiple notifications (bulk)
  static async createMany(notifications) {
    if (notifications.length === 0) return [];

    const values = [];
    const placeholders = [];

    notifications.forEach((notif, index) => {
      const base = index * 5;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
      values.push(
        notif.user_id,
        notif.sender_user_id,
        notif.type,
        notif.recipe_id,
        notif.message
      );
    });

    const query = `
      INSERT INTO notifications (user_id, sender_user_id, type, recipe_id, message)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows;
  }

  // Get user's notifications
  static async findByUserId(userId, { limit, offset, unread } = {}) {
    let query = `
      SELECT n.*, u.username as sender_username, u.profile_picture_url as sender_picture,
             r.title as recipe_title
      FROM notifications n
      LEFT JOIN users u ON n.sender_user_id = u.id
      LEFT JOIN recipes r ON n.recipe_id = r.id
      WHERE n.user_id = $1
    `;
    const values = [userId];
    let paramCount = 1;

    if (unread !== undefined) {
      paramCount++;
      query += ` AND n.is_read = $${paramCount}`;
      values.push(!unread); // Convert to boolean (unread=true means is_read=false)
    }

    query += ' ORDER BY n.created_at DESC';

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

  // Get unread count
  static async getUnreadCount(userId) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE';
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Mark as read
  static async markAsRead(id, userId) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Mark all as read
  static async markAllAsRead(userId) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE';
    await db.query(query, [userId]);
  }

  // Delete notification
  static async delete(id, userId) {
    const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  // Delete all read notifications
  static async deleteRead(userId) {
    const query = 'DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE';
    await db.query(query, [userId]);
  }
}

module.exports = Notification;
