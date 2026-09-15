const mongoose = require('mongoose');

const EventTypes = {
  PDF_OPEN: 'PDF_OPEN',
  PDF_VIEW: 'PDF_VIEW',
  PDF_CLOSE: 'PDF_CLOSE',
  TAB_HIDDEN: 'TAB_HIDDEN',
  TAB_VISIBLE: 'TAB_VISIBLE',
  FULLSCREEN_ENTER: 'FULLSCREEN_ENTER',
  FULLSCREEN_EXIT: 'FULLSCREEN_EXIT',
  PRINT_ATTEMPT: 'PRINT_ATTEMPT',
  SCREEN_CAPTURE_SIGNAL: 'SCREEN_CAPTURE_SIGNAL',
  SCREEN_CAPTURE_ENDED: 'SCREEN_CAPTURE_ENDED',
};

const ResourceActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: Object.values(EventTypes),
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      visibilityState: { type: String, default: 'visible' },
      fullscreen: { type: Boolean, default: false },
      userAgent: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Database Indexes for efficient query performance
ResourceActivitySchema.index({ userId: 1, timestamp: -1 });
ResourceActivitySchema.index({ resourceId: 1, timestamp: -1 });
ResourceActivitySchema.index({ eventType: 1, timestamp: -1 });

const ResourceActivity = mongoose.model('ResourceActivity', ResourceActivitySchema);

module.exports = {
  ResourceActivity,
  EventTypes,
};
