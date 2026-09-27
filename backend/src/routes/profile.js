const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const env = require('../config/env');

router.get('/', requireAuth, async (req, res) => {
  if (!env.DATABASE_URL) {
    return res.status(503).json({
      error: 'Database is not configured. The student profile cannot be loaded.',
      code: 'DB_NOT_CONFIGURED',
    });
  }

  const result = await query('SELECT * FROM students WHERE id = $1', [req.student.id]);
  const student = result.rows[0];

  res.json({
    id: student.id,
    name: student.name,
    email: student.email,
    rollNumber: student.roll_number,
    department: student.department,
    semester: student.semester,
    phone: null,
    cgpa: null,
    major: null,
    branch: null,
    currentSemester: student.semester,
  });
});

router.put('/', requireAuth, async (req, res) => {
  if (!env.DATABASE_URL) {
    return res.status(503).json({
      error: 'Database is not configured. Profile updates are unavailable.',
      code: 'DB_NOT_CONFIGURED',
    });
  }

  const { name, email, rollNumber, department, semester } = req.body || {};

  const updated = await query(
    `UPDATE students
     SET name = COALESCE($1, name), email = COALESCE($2, email), roll_number = COALESCE($3, roll_number), department = COALESCE($4, department), semester = COALESCE($5, semester), updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [name || null, email || null, rollNumber || null, department || null, semester !== undefined ? Number(semester) : null, req.student.id]
  );

  const student = updated.rows[0];

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
