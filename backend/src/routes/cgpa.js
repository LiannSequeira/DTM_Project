const express = require('express');
const router = express.Router();
const { calculateCGPA, predictCGPA } = require('../services/cgpa');

router.post('/calculate', (req, res) => {
  const subjects = Array.isArray(req.body?.subjects) ? req.body.subjects : [];

  if (subjects.length === 0) {
    return res.status(400).json({ error: 'At least one subject is required.', code: 'VALIDATION_ERROR' });
  }

  const invalid = subjects.some((subject) => {
    if (!subject) return true;
    const credits = Number(subject.credits || 0);
    return !Number.isFinite(credits) || credits <= 0;
  });

  if (invalid) {
    return res.status(400).json({ error: 'Each subject requires a positive credit value.', code: 'VALIDATION_ERROR' });
  }

  const result = calculateCGPA(subjects);
  res.json(result);
});

router.post('/predict', (req, res) => {
  const payload = req.body || {};

  if (!payload.currentCGPA && payload.currentCGPA !== 0) {
    return res.status(400).json({ error: 'Current CGPA is required.', code: 'VALIDATION_ERROR' });
  }

  if (!payload.completedCredits && payload.completedCredits !== 0) {
    return res.status(400).json({ error: 'Completed credits are required.', code: 'VALIDATION_ERROR' });
  }

  if (!payload.targetCGPA && payload.targetCGPA !== 0) {
    return res.status(400).json({ error: 'Target CGPA is required.', code: 'VALIDATION_ERROR' });
  }

  if (!payload.upcomingCredits && payload.upcomingCredits !== 0) {
    return res.status(400).json({ error: 'Upcoming credits are required.', code: 'VALIDATION_ERROR' });
  }

  const result = predictCGPA(payload);
  res.json(result);
});

module.exports = router;
