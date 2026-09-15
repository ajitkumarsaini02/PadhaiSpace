const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'padhaispace_super_secret_jwt_key_2026_engineering',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, college, branch, semester } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hardcode role to student - strictly ignore any client-sent role
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      college: typeof college === 'string' ? college.trim() : '',
      branch: branch || 'CSE',
      semester: Number(semester) || 1,
      role: 'student',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
        bookmarks: user.bookmarks,
        token,
      },
    });
  } catch (error) {
    console.error('[Registration Error]', error.message);
    res.status(500).json({ success: false, message: 'Registration failed due to server error' });
  }
};

// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked || user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled by an administrator' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'admin') {
      const { logAdminAction } = require('../utils/auditLogger');
      logAdminAction(user._id, 'ADMIN_LOGIN', 'User', user._id, { email: user.email }, req);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
        bookmarks: user.bookmarks,
        token,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error.message);
    res.status(500).json({ success: false, message: 'Login failed due to server error' });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
};

// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Ignore any role changes to prevent privilege escalation
    if (req.body.name && typeof req.body.name === 'string') {
      user.name = req.body.name.trim();
    }
    if (req.body.college !== undefined && typeof req.body.college === 'string') {
      user.college = req.body.college.trim();
    }
    if (req.body.branch) user.branch = req.body.branch;
    if (req.body.semester) user.semester = Number(req.body.semester);

    if (req.body.password) {
      if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role, // role remains untouched
        college: updatedUser.college,
        branch: updatedUser.branch,
        semester: updatedUser.semester,
        bookmarks: updatedUser.bookmarks,
      },
    });
  } catch (error) {
    console.error('[Profile Update Error]', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
