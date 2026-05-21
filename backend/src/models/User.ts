import { Pool, QueryResult } from 'pg';
import { IUser, IUserCreateInput, IUserUpdateInput } from '../types/models.types';

import db from '../config/database';

class User {
  // Create new user
  static async create(data: IUserCreateInput): Promise<IUser> {
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, profile_picture_url, created_at
    `;
    const values = [data.username, data.email, data.password_hash, data.first_name, data.last_name];
    const result: QueryResult<IUser> = await db.query(query, values);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id: number): Promise<IUser | undefined> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: QueryResult<IUser> = await db.query(query, [id]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email: string): Promise<IUser | undefined> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult<IUser> = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username: string): Promise<IUser | undefined> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result: QueryResult<IUser> = await db.query(query, [username]);
    return result.rows[0];
  }

  // Update user profile
  static async update(id: number, data: IUserUpdateInput): Promise<IUser | undefined> {
    const query = `
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          profile_picture_url = COALESCE($3, profile_picture_url)
      WHERE id = $4
      RETURNING id, username, email, first_name, last_name, profile_picture_url, updated_at
    `;
    const values = [data.first_name, data.last_name, data.profile_picture_url, id];
    const result: QueryResult<IUser> = await db.query(query, values);
    return result.rows[0];
  }

  // Update user profile including email and username
  static async updateProfile(id: number, data: IUserUpdateInput): Promise<IUser | undefined> {
    const query = `
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          username = COALESCE($4, username)
      WHERE id = $5
      RETURNING id, username, email, first_name, last_name, profile_picture_url, updated_at
    `;
    const values = [data.first_name, data.last_name, data.email, data.username, id];
    const result: QueryResult<IUser> = await db.query(query, values);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id: number, password_hash: string): Promise<IUser | undefined> {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id
    `;
    const result: QueryResult<IUser> = await db.query(query, [password_hash, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id: number): Promise<IUser | undefined> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result: QueryResult<IUser> = await db.query(query, [id]);
    return result.rows[0];
  }
}

export default User;
