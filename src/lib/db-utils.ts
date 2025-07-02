import { Pool, PoolClient } from 'pg';
import { query, pool } from '../config/database';

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Query builder helper
export const buildQuery = (
  table: string,
  conditions: Record<string, any> = {},
  options: {
    select?: string[];
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
    limit?: number;
    offset?: number;
  } = {}
) => {
  const { select = ['*'], orderBy = [], limit, offset } = options;
  
  let queryText = `SELECT ${select.join(', ')} FROM ${table}`;
  const values: any[] = [];
  let paramIndex = 1;

  // Add WHERE conditions
  if (Object.keys(conditions).length > 0) {
    const whereClauses = Object.entries(conditions).map(([key, value]) => {
      values.push(value);
      return `${key} = $${paramIndex++}`;
    });
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Add ORDER BY
  if (orderBy.length > 0) {
    const orderClauses = orderBy.map(
      ({ column, direction }) => `${column} ${direction}`
    );
    queryText += ` ORDER BY ${orderClauses.join(', ')}`;
  }

  // Add LIMIT and OFFSET
  if (limit) {
    values.push(limit);
    queryText += ` LIMIT $${paramIndex++}`;
  }
  if (offset) {
    values.push(offset);
    queryText += ` OFFSET $${paramIndex++}`;
  }

  return { text: queryText, values };
};

// CRUD operations
export const dbOperations = {
  // Create
  async create<T extends Record<string, any>>(
    table: string,
    data: T
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO ${table} (${columns.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  },

  // Read
  async findOne<T>(
    table: string,
    conditions: Record<string, any>
  ): Promise<T | null> {
    const { text, values } = buildQuery(table, conditions, { limit: 1 });
    const { rows } = await query(text, values);
    return rows[0] || null;
  },

  async findMany<T>(
    table: string,
    conditions: Record<string, any> = {},
    options: {
      select?: string[];
      orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    const { text, values } = buildQuery(table, conditions, options);
    const { rows } = await query(text, values);
    return rows;
  },

  // Update
  async update<T extends Record<string, any>>(
    table: string,
    conditions: Record<string, any>,
    data: Partial<T>
  ): Promise<T[]> {
    const setClauses = Object.keys(data).map(
      (key, i) => `${key} = $${i + 1}`
    );
    const whereClauses = Object.keys(conditions).map(
      (key, i) => `${key} = $${i + Object.keys(data).length + 1}`
    );
    
    const values = [...Object.values(data), ...Object.values(conditions)];
    
    const { rows } = await query(
      `UPDATE ${table}
       SET ${setClauses.join(', ')}
       WHERE ${whereClauses.join(' AND ')}
       RETURNING *`,
      values
    );
    
    return rows;
  },

  // Delete
  async delete(
    table: string,
    conditions: Record<string, any>
  ): Promise<number> {
    const whereClauses = Object.keys(conditions).map(
      (key, i) => `${key} = $${i + 1}`
    );
    
    const { rowCount } = await query(
      `DELETE FROM ${table}
       WHERE ${whereClauses.join(' AND ')}`,
      Object.values(conditions)
    );
    
    return rowCount;
  },

  // Count
  async count(
    table: string,
    conditions: Record<string, any> = {}
  ): Promise<number> {
    const { text, values } = buildQuery(table, conditions, {
      select: ['COUNT(*) as count'],
    });
    const { rows } = await query(text, values);
    return parseInt(rows[0].count);
  },
};

// Export a default instance with all operations
export default dbOperations; 