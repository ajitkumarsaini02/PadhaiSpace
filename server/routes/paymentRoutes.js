const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getMyPurchases,
  checkSubjectAccess,
  getAdminPayments,
  getAdminAccessList,
  revokeAccess,
  getRevenueStats,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

// Public Webhook (verified internally via HMAC header)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected Student Payment Endpoints
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my', protect, getMyPurchases);
router.get('/check-access/:subjectId', protect, checkSubjectAccess);

// Protected Admin Management Endpoints
router.get('/admin/payments', protect, adminOnly, getAdminPayments);
router.get('/admin/access', protect, adminOnly, getAdminAccessList);
router.put('/admin/access/:id/revoke', protect, adminOnly, revokeAccess);
router.get('/admin/revenue', protect, adminOnly, getRevenueStats);

module.exports = router;
