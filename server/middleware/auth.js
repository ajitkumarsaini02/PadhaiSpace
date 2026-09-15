const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'padhaispace_super_secret_jwt_key_2026_engineering'
      );

      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      if (req.user.isBlocked || req.user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your account has been disabled by an administrator' });
      }
      return next();
    } catch (error) {
      console.error('[Auth Failure]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
};

const authenticateUser = protect;
const requireAdmin = adminOnly;

module.exports = { protect, adminOnly, authenticateUser, requireAdmin };
