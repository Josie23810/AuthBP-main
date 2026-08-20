import express from 'express';
import { adminSignin, adminSignout, adminOverview } from '../controllers/admin.controller.js';
import {
  listUsers,
  getUser,
  updateUser,
  adminDeleteUser,
  dashboardStats,
  securityEvents,
  listSessions,
  getSession,
  revokeSession,
  authenticationStats,
  analytics,
  getAdminSettings,
  updateAdminSettings,
  listNotifications,
  markNotificationsRead,
  updateAdminProfile,
  changeAdminPassword,
} from '../controllers/admin.data.controller.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.post('/signin', adminSignin);
router.get('/signout', adminSignout);

router.get('/overview', verifyAdmin, adminOverview);
router.get('/dashboard-stats', verifyAdmin, dashboardStats);

router.get('/users', verifyAdmin, listUsers);
router.get('/users/:id', verifyAdmin, getUser);
router.patch('/users/:id', verifyAdmin, updateUser);
router.delete('/users/:id', verifyAdmin, adminDeleteUser);

router.get('/security-events', verifyAdmin, securityEvents);
router.get('/sessions', verifyAdmin, listSessions);
router.get('/sessions/:id', verifyAdmin, getSession);
router.post('/sessions/:id/revoke', verifyAdmin, revokeSession);

router.get('/authentication-stats', verifyAdmin, authenticationStats);
router.get('/analytics', verifyAdmin, analytics);

router.get('/settings', verifyAdmin, getAdminSettings);
router.patch('/settings', verifyAdmin, updateAdminSettings);

router.get('/notifications', verifyAdmin, listNotifications);
router.patch('/notifications/read', verifyAdmin, markNotificationsRead);

router.patch('/profile', verifyAdmin, updateAdminProfile);
router.post('/change-password', verifyAdmin, changeAdminPassword);

export default router;
