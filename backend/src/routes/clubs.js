const express = require('express');
const router = express.Router();
const { clubs, events, getClubs } = require('../services/clubs');

router.get('/clubs', (req, res) => {
  const filters = {
    category: req.query.category || undefined,
    search: req.query.search || undefined,
  };

  res.json({ clubs: getClubs(filters), total: getClubs(filters).length });
});

router.get('/events', (req, res) => {
  res.json({ events, total: events.length });
});

module.exports = router;
