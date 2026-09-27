const env = require('../config/env');

async function embedText(text) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing. Embedding generation is unavailable.');
  }

  const response = await fetch(`${env.LLM_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Embedding request failed: ${errorBody}`);
  }

  const payload = await response.json();
  return payload.data[0].embedding;
}

async function embedBatch(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const embeddings = [];

  for (const text of texts) {
    embeddings.push(await embedText(text));
  }

  return embeddings;
}

module.exports = {
  embedText,
  embedBatch,
};
