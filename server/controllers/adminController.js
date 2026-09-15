const User = require('../models/User');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Branch = require('../models/Branch');
const Unit = require('../models/Unit');
const Payment = require('../models/Payment');
const SubjectAccess = require('../models/SubjectAccess');
const ResourceActivity = require('../models/ResourceActivity');
const AdminAuditLog = require('../models/AdminAuditLog');
const { logAdminAction } = require('../utils/auditLogger');

// @route GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalSubjects = await Subject.countDocuments({});
    const totalResources = await Resource.countDocuments({});
    const totalPDFs = await Resource.countDocuments({
      $or: [{ type: 'pdf' }, { type: 'unit-pdf' }, { type: 'notes' }, { fileUrl: { $regex: /\.pdf$/i } }],
    });

    const totalPayments = await Payment.countDocuments({});
    const successfulPayments = await Payment.countDocuments({ status: 'captured' });
    const pendingPayments = await Payment.countDocuments({ status: { $in: ['created', 'pending'] } });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    const refundedPayments = await Payment.countDocuments({ status: 'refunded' });

    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, totalPaise: { $sum: '$amount' } } },
    ]);
    const totalRevenuePaise = revenueAgg[0]?.totalPaise || 0;
    const totalRevenue = totalRevenuePaise / 100;

    const activeSubjectAccess = await SubjectAccess.countDocuments({ status: 'active' });

    // Recent items for Dashboard
    const recentUsers = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({})
      .populate('userId', 'name email')
      .populate('subjectId', 'name code price')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = await ResourceActivity.find({})
      .populate('userId', 'name email')
      .populate('resourceId', 'title type')
      .populate('subjectId', 'name code')
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSubjects,
        totalResources,
        totalPDFs,
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        totalRevenue,
        activeSubjectAccess,
        recentUsers,
        recentPayments,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { q, branch, status, page = 1, limit = 50 } = req.query;
    let query = { role: 'student' };

    if (branch && branch !== 'all') {
      query.branch = branch;
    }

    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = { $ne: true };
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { college: regex }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify admin account status' });
    }

    user.isBlocked = Boolean(isBlocked);
    user.isActive = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? 'USER_DISABLED' : 'USER_ENABLED';
    await logAdminAction(req.user._id, action, 'User', user._id, { email: user.email, name: user.name }, req);

    res.json({
      success: true,
      message: `Student account ${user.isBlocked ? 'disabled' : 'enabled'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/access/grant
exports.grantSubjectAccess = async (req, res) => {
  try {
    const { userId, subjectId, reason } = req.body;

    if (!userId || !subjectId) {
      return res.status(400).json({ success: false, message: 'User ID and Subject ID are required' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const access = await SubjectAccess.findOneAndUpdate(
      { userId, subjectId },
      {
        status: 'active',
        grantedAt: new Date(),
        revokedAt: null,
      },
      { upsert: true, new: true }
    );

    await logAdminAction(
      req.user._id,
      'ACCESS_GRANTED',
      'SubjectAccess',
      access._id,
      { studentEmail: student.email, subjectName: subject.name, reason: reason || 'Admin override' },
      req
    );

    res.json({
      success: true,
      message: `Access granted to ${student.name} for ${subject.name}`,
      data: access,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/access/:id/revoke
exports.revokeSubjectAccess = async (req, res) => {
  try {
    const { reason } = req.body;
    const access = await SubjectAccess.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('subjectId', 'name code');

    if (!access) {
      return res.status(404).json({ success: false, message: 'Subject access record not found' });
    }

    access.status = 'revoked';
    access.revokedAt = new Date();
    await access.save();

    await logAdminAction(
      req.user._id,
      'ACCESS_REVOKED',
      'SubjectAccess',
      access._id,
      { studentEmail: access.userId?.email, subjectName: access.subjectId?.name, reason: reason || 'Admin revoked' },
      req
    );

    res.json({
      success: true,
      message: 'Subject access revoked successfully',
      data: access,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/search
exports.globalAdminSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({
        success: true,
        users: [],
        subjects: [],
        units: [],
        resources: [],
        payments: [],
        accessRecords: [],
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { college: regex }],
    })
      .select('-password')
      .limit(10);

    const subjects = await Subject.find({
      $or: [{ name: regex }, { code: regex }, { description: regex }],
    }).limit(10);

    const units = await Unit.find({
      title: regex,
    })
      .populate('subjectId', 'name code')
      .limit(10);

    const resources = await Resource.find({
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .populate('subjectId', 'name code')
      .limit(10);

    const payments = await Payment.find({
      $or: [{ razorpayOrderId: regex }, { razorpayPaymentId: regex }, { receipt: regex }],
    })
      .populate('userId', 'name email')
      .populate('subjectId', 'name code')
      .limit(10);

    const accessRecords = await SubjectAccess.find({})
      .populate({
        path: 'userId',
        match: { $or: [{ name: regex }, { email: regex }] },
        select: 'name email',
      })
      .populate('subjectId', 'name code')
      .limit(10);

    const filteredAccess = accessRecords.filter((acc) => acc.userId !== null);

    res.json({
      success: true,
      query: q,
      users,
      subjects,
      units,
      resources,
      payments,
      accessRecords: filteredAccess,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AdminAuditLog.find({})
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AdminAuditLog.countDocuments({});

    res.json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
