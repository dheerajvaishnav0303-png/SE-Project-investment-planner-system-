import express from 'express';
import {
  getCustomerPortfolio,
  getAvailablePlans,
  getMyInvestments,
  createInvestment,
  getMyTransactions,
  createTransaction,
  getMyNotifications,
  markNotificationRead
} from '../controllers/customerController.js';
import { protect, requireActive } from '../middleware/authMiddleware.js';

const router = express.Router();

// All customer routes are protected by JWT authentication
router.use(protect);

router.get('/portfolio', getCustomerPortfolio);
router.get('/plans', getAvailablePlans);
router.get('/investments', getMyInvestments);
router.post('/investments', requireActive, createInvestment);
router.get('/transactions', getMyTransactions);
router.post('/transactions', requireActive, createTransaction);
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
