import express from 'express';
import {
  getPlan,
  getDashboardSummary
} from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/plan', getPlan);
router.get('/summary', getDashboardSummary);

export default router;
