const env = require('../config/env');

async function createCompletion({ systemPrompt, userPrompt, context }) {
  if (!env.OPENAI_API_KEY) {
    return {
      ok: false,
      answer: 'The LLM is not configured because OPENAI_API_KEY is missing. Add the key to enable grounded AI responses.',
    };
  }

  const response = await fetch(`${env.LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Question: ${userPrompt}\n\nContext:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      answer: `LLM request failed: ${body}`,
    };
  }

  const payload = await response.json();
  const message = payload.choices?.[0]?.message?.content || 'No answer generated';

  return {
    ok: true,
    answer: message.trim(),
  };
}

module.exports = {
  createCompletion,
};
