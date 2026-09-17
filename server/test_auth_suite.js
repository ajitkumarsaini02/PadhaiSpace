const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'padhaispace_super_secret_jwt_key_2026_engineering';

// Helper to simulate express request/response for testing controllers directly
const makeReqRes = (body = {}, headers = {}, user = null) => {
  const req = {
    body,
    headers,
    user,
  };

  const res = {
    statusCode: 200,
    headers: {},
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
    },
  };

  return { req, res };
};

async function runAuthTestSuite() {
  console.log('=============================================================================');
  console.log('         RUNNING PADHAISPACE COMPREHENSIVE AUTHENTICATION TEST SUITE         ');
  console.log('=============================================================================\n');

  await connectDB();

  const authController = require('./controllers/authController');
  const { authenticateUser, requireAdmin } = require('./middleware/auth');
  const adminController = require('./controllers/adminController');

  // Cleanup test accounts
  const testStudentEmail = 'test_student_auth@padhaispace.com';
  const testEscalateEmail = 'test_escalate_auth@padhaispace.com';
  const testAdminEmail = 'owner_admin_auth@padhaispace.com';

  await User.deleteMany({ email: { $in: [testStudentEmail, testEscalateEmail, testAdminEmail] } });

  // Setup 1: Owner manually creates ONE Admin in database
  console.log('[Setup] Manually creating owner Admin account directly in database...');
  const salt = await bcrypt.genSalt(10);
  const hashedAdminPass = await bcrypt.hash('AdminSecret123!', salt);
  const adminUser = await User.create({
    name: 'PadhaiSpace Admin',
    email: testAdminEmail,
    password: hashedAdminPass,
    role: 'admin',
    college: 'PadhaiSpace HO',
  });
  console.log(`   ✓ Admin created directly in DB with _id: ${adminUser._id}`);

  // Test 8: Public registration with role=admin
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 8: Public registration with role="admin" (must force role="student")');
  console.log('-----------------------------------------------------------------------------');
  const regReqRes = makeReqRes({
    name: 'Attempt Escalation Student',
    email: testEscalateEmail,
    password: 'Password123!',
    college: 'Engineering College',
    role: 'admin', // FORCED ROLE ESCALATION ATTEMPT
  });
  await authController.registerUser(regReqRes.req, regReqRes.res);

  if (regReqRes.res.statusCode !== 201) {
    throw new Error(`Registration failed with status ${regReqRes.res.statusCode}`);
  }
  const createdUser = regReqRes.res.jsonData.data;
  if (createdUser.role !== 'student') {
    throw new Error(`SECURITY FAILURE: Registered user received role "${createdUser.role}", expected "student"`);
  }
  if (createdUser.password) {
    throw new Error('SECURITY FAILURE: Password hash was exposed in registration response!');
  }
  console.log(`   ✓ PASS: Registration forced role="${createdUser.role}" and password hash was NOT exposed.`);

  // Test 1: Student Login
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 1: Student Login');
  console.log('-----------------------------------------------------------------------------');
  const studentLoginReqRes = makeReqRes({
    email: testEscalateEmail,
    password: 'Password123!',
  });
  await authController.loginUser(studentLoginReqRes.req, studentLoginReqRes.res);

  if (studentLoginReqRes.res.statusCode !== 200) {
    throw new Error(`Student login failed with status ${studentLoginReqRes.res.statusCode}`);
  }
  const studentData = studentLoginReqRes.res.jsonData.data;
  const studentToken = studentData.token;
  if (!studentToken) throw new Error('Student login did not return a JWT token!');
  if (studentData.role !== 'student') throw new Error(`Student role is ${studentData.role}`);
  if (studentData.password) throw new Error('SECURITY FAILURE: Password hash was exposed in login response!');
  console.log('   ✓ PASS: Student login successful. Received valid JWT and role="student". Password hash hidden.');

  // Test 2: Admin Login
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 2: Admin Login');
  console.log('-----------------------------------------------------------------------------');
  const adminLoginReqRes = makeReqRes({
    email: testAdminEmail,
    password: 'AdminSecret123!',
  });
  await authController.loginUser(adminLoginReqRes.req, adminLoginReqRes.res);

  if (adminLoginReqRes.res.statusCode !== 200) {
    throw new Error(`Admin login failed with status ${adminLoginReqRes.res.statusCode}`);
  }
  const adminData = adminLoginReqRes.res.jsonData.data;
  const adminToken = adminData.token;
  if (!adminToken) throw new Error('Admin login did not return a JWT token!');
  if (adminData.role !== 'admin') throw new Error(`Admin role is ${adminData.role}`);
  console.log('   ✓ PASS: Admin login successful. Received valid JWT and role="admin".');

  // Test 3: Student accessing Admin API
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 3: Student Accessing Admin API (GET /api/admin/stats)');
  console.log('-----------------------------------------------------------------------------');
  let authMiddlewarePassed = false;
  const adminReqRes = makeReqRes({}, { authorization: `Bearer ${studentToken}` });
  await authenticateUser(adminReqRes.req, adminReqRes.res, async () => {
    authMiddlewarePassed = true;
    await requireAdmin(adminReqRes.req, adminReqRes.res, () => {
      throw new Error('SECURITY FAILURE: Student was allowed into admin controller!');
    });
  });

  if (adminReqRes.res.statusCode !== 403) {
    throw new Error(`Expected HTTP 403 Access Denied, got HTTP ${adminReqRes.res.statusCode}`);
  }
  console.log('   ✓ PASS: Student access to admin endpoint returned HTTP 403 Access Denied.');

  // Test 4: Student Attempting Role Escalation via Profile Update
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 4: Student Attempting Role Escalation via Profile Update');
  console.log('-----------------------------------------------------------------------------');
  const profileReqRes = makeReqRes({ name: 'Hacker Student', role: 'admin' }, {}, { _id: createdUser._id });
  await authController.updateProfile(profileReqRes.req, profileReqRes.res);

  const dbUser = await User.findById(createdUser._id);
  if (dbUser.role !== 'student') {
    throw new Error(`SECURITY FAILURE: User role escalated to "${dbUser.role}" via profile update!`);
  }
  console.log(`   ✓ PASS: Profile update ignored role parameter. Database role remains "${dbUser.role}".`);

  // Test 5: Invalid JWT
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 5: Invalid JWT Verification');
  console.log('-----------------------------------------------------------------------------');
  const invalidJwtReqRes = makeReqRes({}, { authorization: 'Bearer completely_invalid_jwt_string' });
  await authenticateUser(invalidJwtReqRes.req, invalidJwtReqRes.res, () => {
    throw new Error('SECURITY FAILURE: Invalid JWT was accepted!');
  });
  if (invalidJwtReqRes.res.statusCode !== 401) {
    throw new Error(`Expected HTTP 401 Unauthorized for invalid JWT, got ${invalidJwtReqRes.res.statusCode}`);
  }
  console.log('   ✓ PASS: Invalid JWT returned HTTP 401 Unauthorized.');

  // Test 6: Expired JWT
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 6: Expired JWT Verification');
  console.log('-----------------------------------------------------------------------------');
  const expiredToken = jwt.sign({ id: createdUser._id }, JWT_SECRET, { expiresIn: '-1s' });
  const expiredJwtReqRes = makeReqRes({}, { authorization: `Bearer ${expiredToken}` });
  await authenticateUser(expiredJwtReqRes.req, expiredJwtReqRes.res, () => {
    throw new Error('SECURITY FAILURE: Expired JWT was accepted!');
  });
  if (expiredJwtReqRes.res.statusCode !== 401) {
    throw new Error(`Expected HTTP 401 Unauthorized for expired JWT, got ${expiredJwtReqRes.res.statusCode}`);
  }
  console.log('   ✓ PASS: Expired JWT returned HTTP 401 Unauthorized.');

  // Test 7: Forged JWT (signed with wrong secret)
  console.log('\n-----------------------------------------------------------------------------');
  console.log('TEST 7: Forged JWT Verification (wrong secret)');
  console.log('-----------------------------------------------------------------------------');
  const forgedToken = jwt.sign({ id: createdUser._id, role: 'admin' }, 'attacker_fake_secret_key');
  const forgedJwtReqRes = makeReqRes({}, { authorization: `Bearer ${forgedToken}` });
  await authenticateUser(forgedJwtReqRes.req, forgedJwtReqRes.res, () => {
    throw new Error('SECURITY FAILURE: Forged JWT signed with attacker key was accepted!');
  });
  if (forgedJwtReqRes.res.statusCode !== 401) {
    throw new Error(`Expected HTTP 401 Unauthorized for forged JWT, got ${forgedJwtReqRes.res.statusCode}`);
  }
  console.log('   ✓ PASS: Forged JWT returned HTTP 401 Unauthorized.');

  // Cleanup test accounts
  await User.deleteMany({ email: { $in: [testStudentEmail, testEscalateEmail, testAdminEmail] } });

  console.log('\n=============================================================================');
  console.log('    ✓ ALL 8 MANDATORY AUTHENTICATION & SECURITY TESTS PASSED PERFECTLY!    ');
  console.log('=============================================================================\n');

  process.exit(0);
}

runAuthTestSuite().catch((err) => {
  console.error('\n❌ AUTH TEST SUITE FAILURE:', err.message);
  process.exit(1);
});
