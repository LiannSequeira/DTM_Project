const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const resourceRoutes = require('./routes/resources');
const cgpaRoutes = require('./routes/cgpa');
const clubsRoutes = require('./routes/clubs');
const feedbackRoutes = require('./routes/feedback');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS policy violation'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Campus Companion API',
    environment: env.APP_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', resourceRoutes);
app.use('/api/cgpa', cgpaRoutes);
app.use('/api', clubsRoutes);
app.use('/api', feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

module.exports = app;
