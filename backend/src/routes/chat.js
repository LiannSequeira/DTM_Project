const express = require('express');
const router = express.Router();
const { answerQuestion } = require('../services/rag');

async function handleChatRequest(req, res) {
  const message = (req.body && req.body.message) || '';

  if (!message.trim()) {
    return res.status(400).json({ error: 'Message is required.', code: 'VALIDATION_ERROR' });
  }

  const result = await answerQuestion(message);
  return res.json(result);
}

router.post('/', handleChatRequest);
router.post('/message', handleChatRequest);

router.get('/history', async (req, res) => {
  res.json({ conversations: [], message: 'Local document search is active and no remote conversation store is required for this demo.' });
});

module.exports = router;
