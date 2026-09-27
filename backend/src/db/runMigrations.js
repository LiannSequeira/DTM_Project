const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const env = require('../config/env');

async function runMigrations() {
  if (!env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL missing. Skipping migrations.');
    return { ok: false, reason: 'DATABASE_URL missing' };
  }

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await query(sql);
    console.log('✅ Database schema initialized.');
    return { ok: true };
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runMigrations().catch((error) => {
    process.exitCode = 1;
  });
}

module.exports = { runMigrations };
