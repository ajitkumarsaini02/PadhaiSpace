const { ResourceActivity, EventTypes } = require('../models/ResourceActivity');
const Resource = require('../models/Resource');
const User = require('../models/User');

// @route   POST /api/resource-activities
// @access  Private (Authenticated Students & Admins)
exports.logActivity = async (req, res) => {
  try {
    const { resourceId, eventType, sessionId, metadata } = req.body;

    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'resourceId is required' });
    }

    if (!eventType || !Object.values(EventTypes).includes(eventType)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing eventType' });
    }

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    // Verify resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // ALWAYS extract userId from req.user._id (JWT token) to prevent impersonation
    const userId = req.user._id;

    const activity = await ResourceActivity.create({
      userId,
      resourceId,
      eventType,
      sessionId,
      timestamp: new Date(),
      metadata: {
        visibilityState: metadata?.visibilityState || 'visible',
        fullscreen: Boolean(metadata?.fullscreen),
        userAgent: metadata?.userAgent || req.headers['user-agent'] || '',
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('[Activity Log Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/resource-activities
// @access  Private (Admin Only)
exports.getAdminActivities = async (req, res) => {
  try {
    const { resourceId, userId, eventType, sessionId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (resourceId) filter.resourceId = resourceId;
    if (userId) filter.userId = userId;
    if (eventType && Object.values(EventTypes).includes(eventType)) filter.eventType = eventType;
    if (sessionId) filter.sessionId = sessionId;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await ResourceActivity.countDocuments(filter);

    const activities = await ResourceActivity.find(filter)
      .populate('userId', 'name email role college')
      .populate('resourceId', 'title type fileUrl')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: activities.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/resource-activities/stats
// @access  Private (Admin Only)
exports.getActivityStats = async (req, res) => {
  try {
    const { resourceId } = req.query;
    const filter = resourceId ? { resourceId: new mongoose.Types.ObjectId(resourceId) } : {};

    const statsAgg = await ResourceActivity.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
    ]);

    const statsMap = {
      totalEvents: 0,
      pdfOpens: 0,
      pdfViews: 0,
      pdfCloses: 0,
      tabHiddenEvents: 0,
      tabVisibleEvents: 0,
      fullscreenEnters: 0,
      fullscreenExits: 0,
      printAttempts: 0,
      screenCaptureSignals: 0,
      uniqueViewers: 0,
    };

    const allUsersSet = new Set();

    statsAgg.forEach((item) => {
      statsMap.totalEvents += item.count;
      item.uniqueUsers.forEach((u) => allUsersSet.add(u.toString()));

      switch (item._id) {
        case EventTypes.PDF_OPEN:
          statsMap.pdfOpens = item.count;
          break;
        case EventTypes.PDF_VIEW:
          statsMap.pdfViews = item.count;
          break;
        case EventTypes.PDF_CLOSE:
          statsMap.pdfCloses = item.count;
          break;
        case EventTypes.TAB_HIDDEN:
          statsMap.tabHiddenEvents = item.count;
          break;
        case EventTypes.TAB_VISIBLE:
          statsMap.tabVisibleEvents = item.count;
          break;
        case EventTypes.FULLSCREEN_ENTER:
          statsMap.fullscreenEnters = item.count;
          break;
        case EventTypes.FULLSCREEN_EXIT:
          statsMap.fullscreenExits = item.count;
          break;
        case EventTypes.PRINT_ATTEMPT:
          statsMap.printAttempts = item.count;
          break;
        case EventTypes.SCREEN_CAPTURE_SIGNAL:
          statsMap.screenCaptureSignals = item.count;
          break;
        default:
          break;
      }
    });

    statsMap.uniqueViewers = allUsersSet.size;

    res.json({ success: true, data: statsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
