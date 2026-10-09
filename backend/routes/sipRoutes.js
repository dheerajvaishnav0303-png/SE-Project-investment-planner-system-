import express from 'express';
import {
  getSIPs,
  createSIP,
  getSIPById,
  updateSIP,
  deleteSIP
} from '../controllers/sipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSIPs)
  .post(createSIP);

router.route('/:id')
  .get(getSIPById)
  .put(updateSIP)
  .delete(deleteSIP);

export default router;
