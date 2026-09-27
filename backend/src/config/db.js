const { Pool } = require('pg');
const env = require('./env');

const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL }) : null;

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set DATABASE_URL in the environment before using the database-backed APIs.');
  }

  return pool.query(text, params);
}

async function testConnection() {
  if (!pool) {
    return { connected: false, reason: 'DATABASE_URL is missing' };
  }

  try {
    const result = await pool.query('SELECT NOW()');
    return { connected: true, now: result.rows[0].now };
  } catch (error) {
    return { connected: false, reason: error.message };
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
