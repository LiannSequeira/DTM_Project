const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');
const { buildLocalIndex } = require('./services/documents');

async function startServer() {
  await buildLocalIndex();

  const dbStatus = await testConnection();

  if (!dbStatus.connected) {
    console.warn('⚠️ Database not configured:', dbStatus.reason);
  } else {
    console.log('✅ Database connected:', dbStatus.now);
  }

  app.listen(env.PORT, () => {
    console.log(`Campus Companion backend listening on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
