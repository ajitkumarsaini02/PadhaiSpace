const AdminAuditLog = require('../models/AdminAuditLog');

const logAdminAction = async (adminId, action, targetType = '', targetId = '', metadata = {}, req = null) => {
  try {
    const ipAddress = req && req.headers ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AdminAuditLog.create({
      adminId,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : '',
      metadata,
      ipAddress,
    });
  } catch (err) {
    console.error('[Audit Logger Error]', err.message);
  }
};

module.exports = { logAdminAction };
