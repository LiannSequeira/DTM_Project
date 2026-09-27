const express = require('express');
const { query } = require('../config/db');
const env = require('../config/env');
const router = express.Router();

router.post('/feedback', async (req, res) => {
  const { category, message, rating, studentId } = req.body || {};

  if (!category || !message || !message.trim()) {
    return res.status(400).json({ error: 'Category and message are required.', code: 'VALIDATION_ERROR' });
  }

  if (env.DATABASE_URL) {
    try {
      await query(
        `INSERT INTO feedback (student_id, category, rating, message) VALUES ($1, $2, $3, $4)`,
        [studentId || null, category, rating !== undefined && rating !== null ? Number(rating) : null, message]
      );
    } catch (error) {
      return res.status(500).json({ error: 'Unable to save feedback.', code: 'FEEDBACK_SAVE_ERROR' });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback. We appreciate your input.',
    id: Date.now(),
  });
});

module.exports = router;
