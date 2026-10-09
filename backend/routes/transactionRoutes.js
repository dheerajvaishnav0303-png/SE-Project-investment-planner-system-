import express from 'express';
import {
  getTransactions,
  createTransaction
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

export default router;
