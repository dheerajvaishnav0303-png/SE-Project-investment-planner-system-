import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

export default router;
