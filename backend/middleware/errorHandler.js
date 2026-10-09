/**
 * 404 Route Not Found middleware
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
};

/**
 * Global Error Handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('[Server Error]', err.stack);
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
