import express from 'express';
import {
  getProfile,
  updateProfile,
  resetProfile
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/reset', resetProfile);

export default router;
