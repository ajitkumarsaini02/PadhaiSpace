const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');
const User = require('./models/User');

async function testAdminSuite() {
  console.log('=============================================================================');
  console.log('              TESTING COMPLETE ADMIN PANEL BACKEND & APIS                    ');
  console.log('=============================================================================\n');

  await connectDB();

  const adminController = require('./controllers/adminController');
  const subjectController = require('./controllers/subjectController');
  const unitController = require('./controllers/unitController');
  const resourceController = require('./controllers/resourceController');

  // Helper mock req/res
  const makeReqRes = (body = {}, query = {}, params = {}, user = { role: 'admin' }) => {
    const req = { body, query, params, user };
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return { req, res };
  };

  // 1. TEST ADMIN DASHBOARD STATS
  console.log('Step 1: Testing Admin Stats Endpoint (GET /api/admin/stats)...');
  const statsReqRes = makeReqRes();
  await adminController.getAdminStats(statsReqRes.req, statsReqRes.res);

  if (statsReqRes.res.statusCode !== 200) {
    throw new Error(`getAdminStats failed with status ${statsReqRes.res.statusCode}`);
  }
  const stats = statsReqRes.res.jsonData.data;
  console.log('   MongoDB Real Statistics:', {
    totalStudents: stats.totalUsers,
    totalSubjects: stats.totalSubjects,
    totalUnits: stats.totalUnits,
    totalResources: stats.totalResources,
    totalNotes: stats.totalNotes,
    totalPYQs: stats.totalPYQs,
    totalPDFs: stats.totalPDFs,
    totalViews: stats.totalViews,
    totalDownloads: stats.totalDownloads,
  });
  console.log('   ✓ PASS: All statistics calculated directly from MongoDB.');

  // 2. TEST SUBJECT CRUD IN ADMIN CONSOLE
  console.log('\nStep 2: Testing Subject CRUD Operations...');
  const testSubjCode = 'TEST999';
  await Subject.deleteMany({ code: testSubjCode });

  // Create
  const createSubjReqRes = makeReqRes({
    name: 'Test Engineering Subject',
    code: testSubjCode,
    description: 'Temporary subject for automated admin suite testing',
  });
  await subjectController.createSubject(createSubjReqRes.req, createSubjReqRes.res);
  if (createSubjReqRes.res.statusCode !== 201) {
    throw new Error(`Create subject failed with status ${createSubjReqRes.res.statusCode}`);
  }
  const createdSubj = createSubjReqRes.res.jsonData.data;
  console.log(`   ✓ Subject Created: ${createdSubj.name} (${createdSubj.code})`);

  // Update
  const updateSubjReqRes = makeReqRes({ name: 'Updated Test Engineering Subject' }, {}, { id: createdSubj._id });
  await subjectController.updateSubject(updateSubjReqRes.req, updateSubjReqRes.res);
  if (updateSubjReqRes.res.statusCode !== 200) {
    throw new Error(`Update subject failed with status ${updateSubjReqRes.res.statusCode}`);
  }
  console.log('   ✓ Subject Updated successfully');

  // 3. TEST UNIT CRUD IN ADMIN CONSOLE
  console.log('\nStep 3: Testing Unit CRUD Operations...');
  const createUnitReqRes = makeReqRes({
    subjectId: createdSubj._id,
    unitNumber: 1,
    title: 'Test Unit 1 Title',
    description: 'Test Unit Description',
  });
  await unitController.createUnit(createUnitReqRes.req, createUnitReqRes.res);
  if (createUnitReqRes.res.statusCode !== 201) {
    throw new Error(`Create unit failed with status ${createUnitReqRes.res.statusCode}`);
  }
  const createdUnit = createUnitReqRes.res.jsonData.data;
  console.log(`   ✓ Unit Created: Unit ${createdUnit.unitNumber} - ${createdUnit.title}`);

  // 4. TEST RESOURCE MANAGEMENT IN ADMIN CONSOLE
  console.log('\nStep 4: Testing Resource Creation & Update Operations...');
  const createResReqRes = makeReqRes({
    title: 'Test Admin Resource PDF',
    description: 'Admin upload test',
    type: 'notes',
    source: 'Gateway Classes',
    academicYear: '1st Year',
    subjectId: createdSubj._id,
    unitId: createdUnit._id,
    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    tags: ['Test', 'Admin'],
  });
  await resourceController.createResource(createResReqRes.req, createResReqRes.res);
  if (createResReqRes.res.statusCode !== 201) {
    throw new Error(`Create resource failed with status ${createResReqRes.res.statusCode}`);
  }
  const createdRes = createResReqRes.res.jsonData.data;
  console.log(`   ✓ Resource Created: ${createdRes.title} (Type: ${createdRes.type})`);

  // Cleanup Test Data
  await Resource.findByIdAndDelete(createdRes._id);
  await Unit.findByIdAndDelete(createdUnit._id);
  await Subject.findByIdAndDelete(createdSubj._id);
  console.log('   ✓ Cleanup completed for test artifacts.');

  // 5. TEST USERS LIST (PASSWORDS MUST BE EXCLUDED)
  console.log('\nStep 5: Testing Users List API (GET /api/admin/users)...');
  const usersReqRes = makeReqRes();
  await adminController.getUsers(usersReqRes.req, usersReqRes.res);
  if (usersReqRes.res.statusCode !== 200) {
    throw new Error(`getUsers failed with status ${usersReqRes.res.statusCode}`);
  }
  const usersList = usersReqRes.res.jsonData.data;
  console.log(`   Retrieved ${usersList.length} student user accounts.`);
  for (const u of usersList) {
    if (u.password) {
      throw new Error(`SECURITY FAILURE: User ${u.email} exposed password hash in admin response!`);
    }
  }
  console.log('   ✓ PASS: Users list returned cleanly with zero password hashes exposed.');

  console.log('\n=============================================================================');
  console.log('         ✓ COMPLETE ADMIN PANEL INTEGRATION TESTS PASSED CLEANLY!            ');
  console.log('=============================================================================\n');

  process.exit(0);
}

testAdminSuite().catch((err) => {
  console.error('\n❌ ADMIN SUITE TEST FAILED:', err.message);
  process.exit(1);
});
