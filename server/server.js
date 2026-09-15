const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const branchRoutes = require('./routes/branchRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const unitRoutes = require('./routes/unitRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectOfferingRoutes = require('./routes/subjectOfferingRoutes');
const activityRoutes = require('./routes/activityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// 1. Helmet Security Headers (Configured for Razorpay & PDF Blob Viewer)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
        objectSrc: ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. NoSQL Operator Injection Prevention (Strips $ and .)
app.use(mongoSanitize({ replaceWith: '_' }));

// 3. Strict CORS Configuration
const allowedClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedClientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy prohibition'));
      }
    },
    credentials: true,
  })
);

// 4. Rate Limiting Middlewares
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment requests. Please try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/payments/create-order', paymentLimiter);
app.use('/api/payments/verify', paymentLimiter);

// 5. Request Body Size Limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static uploads folder (direct PDF access prohibited)
app.use(
  '/uploads',
  (req, res, next) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
      return res.status(401).json({
        success: false,
        message: 'Direct PDF access prohibited. Please view via protected reader.',
      });
    }
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PadhaiSpace API is running smoothly', time: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-offerings', subjectOfferingRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resource-activities', activityRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Serve frontend build in production if available
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database & Auto-Seed check if empty
const startServer = async () => {
  await connectDB();

  // Auto-seed check
  try {
    const Branch = require('./models/Branch');
    const seedDatabase = require('./seed/seedData');
    const branchCount = await Branch.countDocuments();
    if (branchCount === 0) {
      console.log('[Auto-Seed] Empty database detected. Bootstrapping initial CSE curriculum...');
      await seedDatabase();
      console.log('[Auto-Seed] Database populated successfully!');
    }
  } catch (seedCheckErr) {
    console.warn('[Auto-Seed Check Warn]', seedCheckErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🚀 PadhaiSpace Server running on port ${PORT}`);
    console.log(`  🔒 Production-Grade Security Active`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️ Port ${PORT} is already in use by another process.`);
      console.error(`Attempting automatic port release...\n`);
      require('child_process').exec(`npx kill-port ${PORT}`, () => {
        process.exit(1);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();
