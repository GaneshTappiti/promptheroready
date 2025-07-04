import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PostgreSQL pool configuration
const pool = new Pool({
  connectionString: import.meta.env.VITE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Test the connection
pool.connect()
  .then(() => console.log('Successfully connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));

export { pool };
export default pool;

// Monitor pool events
pool.on('connect', () => {
  console.log('New client connected to pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

// Helper function to execute queries with retry logic
export const query = async (text: string, params?: unknown[], retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log('Executed query', {
        text,
        duration,
        rows: res.rowCount,
        attempt: i + 1
      });
      
      return res;
    } catch (error) {
      lastError = error;
      console.error(`Query attempt ${i + 1} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
};

// Test the database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful!', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Get pool statistics
export const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

// Graceful shutdown
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Pool has ended');
  } catch (error) {
    console.error('Error ending pool:', error);
  }
}; 