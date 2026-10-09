import express from 'express';
import {
  getAdminDashboard,
  getAdminAnalytics,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllInvestments,
  getAllTransactions,
  updateTransactionStatus,
  getAdminPlans,
  createPlan,
  updatePlan,
  togglePlanStatus,
  deletePlan,
  getAdminReports,
  getAdminNotifications,
  createAdminNotification,
  getAdminSettings,
  updateAdminProfile,
  seedDemoInvestors
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication & Administrator privileges on all admin routes
router.use(protect);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Investment Management
router.get('/investments', getAllInvestments);

// Transaction Management
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/status', updateTransactionStatus);

// Investment Plan Management (Admin Creates -> Customer Sees)
router.get('/plans', getAdminPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.patch('/plans/:id/status', togglePlanStatus);
router.delete('/plans/:id', deletePlan);

// Reports & Analytics Export
router.get('/reports', getAdminReports);

// Notifications & Broadcasts
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createAdminNotification);

// Settings
router.get('/settings', getAdminSettings);
router.put('/settings/profile', updateAdminProfile);

// Demo Data Seeder
router.post('/seed', seedDemoInvestors);

export default router;
