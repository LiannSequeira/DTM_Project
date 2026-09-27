const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const studentResult = await query('SELECT * FROM students WHERE id = $1', [decoded.id]);

    if (studentResult.rowCount === 0) {
      return res.status(401).json({ error: 'Student session invalid', code: 'INVALID_SESSION' });
    }

    req.student = studentResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed', code: 'INVALID_TOKEN' });
  }
}

module.exports = {
  requireAuth,
};
