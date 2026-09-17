const User = require('../models/User');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Unit = require('../models/Unit');
const { ResourceActivity } = require('../models/ResourceActivity');
const AdminAuditLog = require('../models/AdminAuditLog');

const { logAdminAction } = require('../utils/auditLogger');

// @route GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalSubjects = await Subject.countDocuments({});
    const totalUnits = await Unit.countDocuments({});
    const totalResources = await Resource.countDocuments({});
    const totalPDFs = await Resource.countDocuments({
      $or: [{ type: 'pdf' }, { type: 'unit-pdf' }, { type: 'notes' }, { fileUrl: { $regex: /\.pdf$/i } }],
    });
    const totalPYQs = await Resource.countDocuments({ type: 'pyq' });
    const totalNotes = await Resource.countDocuments({ $or: [{ type: 'notes' }, { type: 'pdf' }, { type: 'unit-pdf' }] });

    const viewStats = await Resource.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' }, totalDownloads: { $sum: '$downloads' } } },
    ]);

    const totalViews = viewStats[0]?.totalViews || 0;
    const totalDownloads = viewStats[0]?.totalDownloads || 0;

    const recentUsers = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = await ResourceActivity.find({})
      .populate('userId', 'name email')
      .populate('resourceId', 'title type')
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSubjects,
        totalUnits,
        totalResources,
        totalPDFs,
        totalPYQs,
        totalNotes,
        totalViews,
        totalDownloads,
        recentUsers,
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
    const { q, page = 1, limit = 50 } = req.query;
    let query = { role: 'student' };

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
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify admin account' });
    }

    res.json({
      success: true,
      message: 'Student account is active',
      data: user,
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

    res.json({
      success: true,
      query: q,
      users,
      subjects,
      units,
      resources,
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
