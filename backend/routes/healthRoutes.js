import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Investment Planner API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
