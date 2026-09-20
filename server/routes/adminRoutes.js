const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  globalAdminSearch,
  getAuditLogs,
  syncSupabaseStorage,
} = require('../controllers/adminController');
const { getAdminActivities, getActivityStats } = require('../controllers/activityController');
const { protect, adminOnly } = require('../middleware/auth');

// All Admin routes enforce protect + adminOnly
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/search', protect, adminOnly, globalAdminSearch);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/status', protect, adminOnly, toggleUserStatus);
router.get('/audit-logs', protect, adminOnly, getAuditLogs);
router.post('/sync-supabase', protect, adminOnly, syncSupabaseStorage);

// Resource Activity Audit Routes (Admin Only)
router.get('/resource-activities', protect, adminOnly, getAdminActivities);
router.get('/resource-activities/stats', protect, adminOnly, getActivityStats);

module.exports = router;
