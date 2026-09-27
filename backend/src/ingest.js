const { runMigrations } = require('./db/runMigrations');
const { buildLocalIndex, getAllDocuments } = require('./services/documents');

async function main() {
  try {
    await runMigrations();
    const index = await buildLocalIndex();
    const docs = index.documents || [];
    const needsReview = docs.filter((doc) => doc.needsReview).length;

    console.log('=== Local PDF ingestion summary ===');
    console.log('PDFs found:', docs.length);
    console.log('PDFs successfully indexed:', docs.filter((doc) => !doc.needsReview).length);
    console.log('PDFs needing review:', needsReview);
    console.log('Catalog path:', require('./services/documents').CATALOG_PATH);
  } catch (error) {
    console.error('Local ingest failed:', error.message);
    process.exitCode = 1;
  }
}

main();
