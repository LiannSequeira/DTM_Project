const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const env = require('../config/env');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

async function ensureDbAvailable(res) {
  if (!env.DATABASE_URL) {
    res.status(503).json({
      error: 'Database is not configured. Set DATABASE_URL to enable auth and registration.',
      code: 'DB_NOT_CONFIGURED',
    });
    return false;
  }

  return true;
}

router.post('/register', async (req, res) => {
  try {
    if (!(await ensureDbAvailable(res))) return;

    const { name, email, password, rollNumber, department, semester } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.', code: 'VALIDATION_ERROR' });
    }

    const existing = await query('SELECT id FROM students WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.', code: 'EMAIL_EXISTS' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const student = await query(
      `INSERT INTO students (name, email, roll_number, department, semester, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, roll_number, department, semester, created_at`,
      [name, email, rollNumber || null, department || null, semester ? Number(semester) : null, passwordHash]
    );

    const created = student.rows[0];
    const token = jwt.sign({ id: created.id, email: created.email }, env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      student: {
        id: created.id,
        name: created.name,
        email: created.email,
        rollNumber: created.roll_number,
        department: created.department,
        semester: created.semester,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 'AUTH_ERROR' });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!(await ensureDbAvailable(res))) return;

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.', code: 'VALIDATION_ERROR' });
    }

    const result = await query('SELECT * FROM students WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    const student = result.rows[0];
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign({ id: student.id, email: student.email }, env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNumber: student.roll_number,
        department: student.department,
        semester: student.semester,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 'AUTH_ERROR' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const { student } = req;
  res.json({
    id: student.id,
    name: student.name,
    email: student.email,
    rollNumber: student.roll_number,
    department: student.department,
    semester: student.semester,
  });
});

module.exports = router;
