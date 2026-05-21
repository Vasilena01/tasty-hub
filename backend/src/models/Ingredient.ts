import { Pool, QueryResult } from 'pg';
import { IIngredient } from '../types/models.types';

import db from '../config/database';

class Ingredient {
  // Create or find ingredient by name
  static async findOrCreate(name: string): Promise<IIngredient> {
    // First try to find existing
    const findQuery = 'SELECT * FROM ingredients WHERE LOWER(name) = LOWER($1)';
    let result: QueryResult<IIngredient> = await db.query(findQuery, [name]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create if doesn't exist
    const createQuery = 'INSERT INTO ingredients (name) VALUES ($1) RETURNING *';
    result = await db.query(createQuery, [name]);
    return result.rows[0];
  }

  // Search ingredients by name (for autocomplete)
  static async search(query: string): Promise<IIngredient[]> {
    const searchQuery = `
      SELECT * FROM ingredients
      WHERE name ILIKE $1
      ORDER BY name
      LIMIT 10
    `;
    const result: QueryResult<IIngredient> = await db.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  // Get all ingredients
  static async findAll(): Promise<IIngredient[]> {
    const query = 'SELECT * FROM ingredients ORDER BY name';
    const result: QueryResult<IIngredient> = await db.query(query);
    return result.rows;
  }

  // Find by ID
  static async findById(id: number): Promise<IIngredient | undefined> {
    const query = 'SELECT * FROM ingredients WHERE id = $1';
    const result: QueryResult<IIngredient> = await db.query(query, [id]);
    return result.rows[0];
  }
}

export default Ingredient;
