function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    code,
  });
}

module.exports = errorHandler;
