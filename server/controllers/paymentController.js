const Payment = require('../models/Payment');
const SubjectAccess = require('../models/SubjectAccess');
const Subject = require('../models/Subject');
const User = require('../models/User');
const {
  razorpayInstance,
  key_id,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../config/razorpay');

// @route POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.user._id;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    // 1. Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // 2. Check if subject is paid
    if (subject.isPaid === false) {
      return res.status(400).json({
        success: false,
        message: 'This subject is free. No payment required.',
        isFree: true,
      });
    }

    // 3. Check if student already owns active access
    const existingAccess = await SubjectAccess.findOne({
      userId,
      subjectId,
      status: 'active',
    });

    if (existingAccess) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Already Unlocked. You already have full access to this subject.',
      });
    }

    // 4. Determine price strictly from backend database (default: ₹9 = 900 paise)
    const subjectPriceInRupees = subject.price || 9;
    const amountInPaise = Math.round(subjectPriceInRupees * 100);

    const receipt = `rcpt_${userId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;
    let razorpayOrderId = '';

    // 5. Try creating Razorpay Order via SDK
    if (razorpayInstance) {
      try {
        const orderOptions = {
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            userId: userId.toString(),
            subjectId: subjectId.toString(),
            subjectName: subject.name,
          },
        };
        const order = await razorpayInstance.orders.create(orderOptions);
        razorpayOrderId = order.id;
      } catch (rzpErr) {
        console.warn('[Razorpay API Warning] API order creation failed, generating secure test order:', rzpErr.message);
        // Fallback for development/test mode if API credentials are mock/unactivated
        razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // 6. Create local Payment record
    const payment = await Payment.create({
      userId,
      subjectId,
      amount: amountInPaise,
      currency: 'INR',
      provider: 'razorpay',
      status: 'created',
      razorpayOrderId,
      receipt,
    });

    // 7. Return payload for frontend checkout
    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: key_id,
        receipt,
      },
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        price: subjectPriceInRupees,
      },
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subjectId } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !subjectId) {
      return res.status(400).json({ success: false, message: 'Missing order details for verification' });
    }

    // Find local payment record
    let payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!payment) {
      // Create record if not found (resilience)
      const subject = await Subject.findById(subjectId);
      const amountInPaise = subject ? (subject.price || 9) * 100 : 900;
      payment = await Payment.create({
        userId,
        subjectId,
        amount: amountInPaise,
        currency: 'INR',
        provider: 'razorpay',
        status: 'created',
        razorpayOrderId: razorpay_order_id,
      });
    }

    // Perform HMAC signature verification
    const isSignatureValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    // Development test mode signature bypass for test orders
    const isTestOrder = razorpay_order_id.startsWith('order_test_') || razorpay_payment_id?.startsWith('pay_test_');

    if (!isSignatureValid && !isTestOrder) {
      // Mark payment failed
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }

    // Mark payment captured/successful
    payment.status = 'captured';
    payment.razorpayPaymentId = razorpay_payment_id || `pay_test_${Date.now()}`;
    payment.paidAt = new Date();
    await payment.save();

    // Create or activate SubjectAccess entitlement
    const access = await SubjectAccess.findOneAndUpdate(
      { userId, subjectId },
      {
        paymentId: payment._id,
        status: 'active',
        grantedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully. Subject unlocked!',
      access,
      payment,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/payments/webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body; // Expecting raw or parsed payload

    // Verify webhook signature if secret configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET !== 'dummyWebhookSecret') {
      const isValid = verifyWebhookSignature(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody), signature);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const eventType = event.event;
    const payload = event.payload?.payment?.entity;

    if (payload) {
      const { order_id, id: payment_id, notes, status } = payload;

      if (order_id) {
        let payment = await Payment.findOne({ razorpayOrderId: order_id });
        if (payment) {
          if (eventType === 'payment.captured' || status === 'captured') {
            payment.status = 'captured';
            payment.razorpayPaymentId = payment_id;
            payment.paidAt = payment.paidAt || new Date();
            await payment.save();

            // Grant access idempotently
            await SubjectAccess.findOneAndUpdate(
              { userId: payment.userId, subjectId: payment.subjectId },
              { paymentId: payment._id, status: 'active', grantedAt: new Date() },
              { upsert: true, new: true }
            );
          } else if (eventType === 'payment.failed') {
            payment.status = 'failed';
            await payment.save();
          } else if (eventType === 'refund.processed' || eventType === 'payment.refunded') {
            payment.status = 'refunded';
            await payment.save();

            // Revoke access on refund
            await SubjectAccess.findOneAndUpdate(
              { userId: payment.userId, subjectId: payment.subjectId },
              { status: 'revoked' }
            );
          }
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payments/my
exports.getMyPurchases = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch active subject access list
    const accesses = await SubjectAccess.find({ userId, status: 'active' })
      .populate('subjectId')
      .populate('paymentId')
      .sort({ grantedAt: -1 });

    // Fetch all user payment history
    const payments = await Payment.find({ userId })
      .populate('subjectId', 'name code price isPaid')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      accesses,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payments/check-access/:subjectId
exports.checkSubjectAccess = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    // TEMPORARILY COMMENTED OUT - ALL SUBJECTS UNLOCKED FOR FREE
    return res.json({
      success: true,
      unlocked: true,
      isPaid: false,
      price: 0,
      message: 'All files free for now',
    });

    /*
    const userId = req.user._id;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Admin has full override
    if (req.user.role === 'admin') {
      return res.json({ success: true, unlocked: true, isAdmin: true, isPaid: subject.isPaid });
    }

    // Free subject
    if (subject.isPaid === false) {
      return res.json({ success: true, unlocked: true, isPaid: false });
    }

    // Check active entitlement
    const access = await SubjectAccess.findOne({
      userId,
      subjectId,
      status: 'active',
    });

    res.json({
      success: true,
      unlocked: !!access,
      isPaid: true,
      price: subject.price || 9,
    });
    */
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADMIN CONTROLLERS =================

// @route GET /api/payments/admin/all
exports.getAdminPayments = async (req, res) => {
  try {
    const { status, studentId, subjectId, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (studentId) query.userId = studentId;
    if (subjectId) query.subjectId = subjectId;

    const payments = await Payment.find(query)
      .populate('userId', 'name email role')
      .populate('subjectId', 'name code price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payments/admin/access
exports.getAdminAccessList = async (req, res) => {
  try {
    const accesses = await SubjectAccess.find()
      .populate('userId', 'name email role')
      .populate('subjectId', 'name code price')
      .populate('paymentId', 'amount status razorpayPaymentId razorpayOrderId paidAt')
      .sort({ grantedAt: -1 });

    res.json({
      success: true,
      count: accesses.length,
      data: accesses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/payments/admin/access/:id/revoke
exports.revokeAccess = async (req, res) => {
  try {
    const access = await SubjectAccess.findById(req.params.id);
    if (!access) {
      return res.status(404).json({ success: false, message: 'Subject access record not found' });
    }

    access.status = 'revoked';
    await access.save();

    res.json({
      success: true,
      message: 'Subject access revoked successfully. Payment record preserved.',
      data: access,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payments/admin/revenue
exports.getRevenueStats = async (req, res) => {
  try {
    const capturedPayments = await Payment.find({ status: 'captured' });
    const totalRevenuePaise = capturedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalPurchases = capturedPayments.length;
    const pendingCount = await Payment.countDocuments({ status: { $in: ['created', 'pending'] } });
    const failedCount = await Payment.countDocuments({ status: 'failed' });
    const refundedCount = await Payment.countDocuments({ status: 'refunded' });

    // Most purchased subjects aggregation
    const topSubjectsAgg = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: '$subjectId', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
    ]);

    const topSubjects = topSubjectsAgg.map((item) => ({
      subjectId: item._id,
      name: item.subject.name,
      code: item.subject.code,
      count: item.count,
      totalRevenueRupees: item.totalRevenue / 100,
    }));

    res.json({
      success: true,
      stats: {
        totalRevenueRupees: totalRevenuePaise / 100,
        totalRevenuePaise,
        totalPurchases,
        pendingCount,
        failedCount,
        refundedCount,
        topSubjects,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
