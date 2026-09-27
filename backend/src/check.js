const env = require('./config/env');
const { testConnection } = require('./config/db');
const { getPineconeStatus } = require('./services/pinecone');
const { getAllDocuments } = require('./services/documents');

async function runChecks() {
  const dbStatus = await testConnection();
  const pineconeStatus = getPineconeStatus();
  const docs = await getAllDocuments();
  const toReview = docs.filter((doc) => doc.needsReview).length;

  console.log('=== Campus Companion backend status ===');
  console.log('Database:', dbStatus.connected ? 'configured' : 'missing');
  console.log('Pinecone:', pineconeStatus.configured ? 'configured' : 'missing');
  console.log('Documents in catalog:', docs.length);
  console.log('PDFs needing review:', toReview);
  console.log('Official documents:', docs.filter((doc) => doc.sourceType === 'official').length);
  console.log('PYQ documents:', docs.filter((doc) => doc.sourceType === 'pyq').length);
  console.log('LLM:', env.OPENAI_API_KEY ? 'configured' : 'missing');
  console.log('Environment file:', env.DATABASE_URL ? 'present' : 'missing');
}

runChecks().catch((error) => {
  console.error(error);
  process.exit(1);
});
