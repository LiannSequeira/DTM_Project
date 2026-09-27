const { Pinecone } = require('@pinecone-database/pinecone');
const env = require('../config/env');

let pineconeInstance = null;

if (env.PINECONE_API_KEY && env.PINECONE_INDEX) {
  pineconeInstance = new Pinecone({ apiKey: env.PINECONE_API_KEY });
}

function getPineconeStatus() {
  if (!env.PINECONE_API_KEY || !env.PINECONE_INDEX) {
    return {
      configured: false,
      reason: 'PINECONE_API_KEY and PINECONE_INDEX are not configured.',
    };
  }

  return {
    configured: true,
    index: env.PINECONE_INDEX,
    namespace: env.PINECONE_NAMESPACE,
  };
}

async function upsertVector({ id, values, metadata = {} }) {
  if (!pineconeInstance) {
    return { ok: false, reason: 'Pinecone is not configured. Add PINECONE_API_KEY and PINECONE_INDEX to enable vector ingestion.' };
  }

  const index = pineconeInstance.Index(env.PINECONE_INDEX);

  await index.upsert({
    namespace: env.PINECONE_NAMESPACE,
    vectors: [{ id, values, metadata }],
  });

  return { ok: true, id };
}

async function searchSimilar({ values, filter = {}, topK = 5 }) {
  if (!pineconeInstance) {
    return { ok: false, reason: 'Pinecone is not configured. Add PINECONE_API_KEY and PINECONE_INDEX to enable similarity search.' };
  }

  const index = pineconeInstance.Index(env.PINECONE_INDEX);

  const response = await index.query({
    namespace: env.PINECONE_NAMESPACE,
    vector: values,
    topK,
    includeMetadata: true,
    filter,
  });

  return {
    ok: true,
    matches: response.matches || [],
  };
}

module.exports = {
  getPineconeStatus,
  upsertVector,
  searchSimilar,
};
