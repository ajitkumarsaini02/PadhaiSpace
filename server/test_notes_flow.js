const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');

async function testNotesFlow() {
  console.log('=============================================================================');
  console.log('            TESTING COMPLETE NOTES ARCHITECTURE & FLOW                       ');
  console.log('=============================================================================\n');

  await connectDB();

  const resourceController = require('./controllers/resourceController');

  // Helper mock req/res
  const makeReqRes = (query = {}) => {
    const req = { query };
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

  // 1. Ensure DBMS Subject & Unit 1 exist in database
  console.log('Step 1: Setting up DBMS Subject, Unit 1, and Gateway Classes 2nd Year Notes...');
  const dbmsSubject = await Subject.findOneAndUpdate(
    { code: 'BCS501' },
    { name: 'Database Management System', code: 'BCS501', description: 'ER Models, SQL, Normalization' },
    { upsert: true, new: true }
  );

  const dbmsUnit1 = await Unit.findOneAndUpdate(
    { subjectId: dbmsSubject._id, unitNumber: 1 },
    { subjectId: dbmsSubject._id, unitNumber: 1, title: 'ER Modeling & Relational Algebra', description: 'Unit 1 concepts' },
    { upsert: true, new: true }
  );

  // Seed Gateway Classes 2nd Year Note
  const testResource = await Resource.findOneAndUpdate(
    { title: 'Gateway Classes DBMS Unit 1 Master Notes' },
    {
      title: 'Gateway Classes DBMS Unit 1 Master Notes',
      description: 'Handwritten notes for DBMS Unit 1',
      type: 'notes',
      source: 'Gateway Classes',
      academicYear: '2nd Year',
      subjectId: dbmsSubject._id,
      unitId: dbmsUnit1._id,
      fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
      tags: ['Gateway Classes', 'DBMS', '2nd Year', 'Unit 1'],
    },
    { upsert: true, new: true }
  );
  console.log(`   ✓ Sample Gateway Classes Note created with ID: ${testResource._id}`);

  // 2. Test GET /api/resources/meta/sources
  console.log('\nStep 2: Testing GET /api/resources/meta/sources (Counts from MongoDB)...');
  const sourcesReqRes = makeReqRes({ type: 'notes' });
  await resourceController.getSources(sourcesReqRes.req, sourcesReqRes.res);

  if (sourcesReqRes.res.statusCode !== 200) {
    throw new Error(`getSources failed with status ${sourcesReqRes.res.statusCode}`);
  }
  const sourcesData = sourcesReqRes.res.jsonData.data;
  console.log('   Dynamic MongoDB Source Counts:', sourcesData);
  const gatewaySourceObj = sourcesData.find(s => s.id === 'gateway-classes');
  if (!gatewaySourceObj || gatewaySourceObj.count < 1) {
    throw new Error('Gateway Classes source count is invalid or 0');
  }
  console.log(`   ✓ PASS: Gateway Classes count dynamically retrieved from MongoDB: ${gatewaySourceObj.count}`);

  // 3. Test GET /api/resources/meta/academic-years?source=gateway-classes
  console.log('\nStep 3: Testing GET /api/resources/meta/academic-years (Dynamic years from MongoDB)...');
  const yearsReqRes = makeReqRes({ source: 'gateway-classes', type: 'notes' });
  await resourceController.getAcademicYears(yearsReqRes.req, yearsReqRes.res);

  if (yearsReqRes.res.statusCode !== 200) {
    throw new Error(`getAcademicYears failed with status ${yearsReqRes.res.statusCode}`);
  }
  const availableYears = yearsReqRes.res.jsonData.data;
  console.log('   Dynamic MongoDB Academic Years for Gateway Classes:', availableYears);
  if (!availableYears.includes('2nd Year')) {
    throw new Error('Expected "2nd Year" to be present in dynamic academic years');
  }
  console.log('   ✓ PASS: Dynamic academic years correctly fetched from MongoDB without hardcoding!');

  // 4. Test Complete Filtering Flow: Notes -> Gateway Classes -> 2nd Year -> DBMS -> Unit 1
  console.log('\nStep 4: Executing Full Flow Query (Source=Gateway Classes, AcademicYear=2nd Year, Subject=DBMS, Unit=1)...');
  const fullFlowReqRes = makeReqRes({
    type: 'notes',
    source: 'gateway-classes',
    academicYear: '2nd Year',
    subjectId: dbmsSubject._id.toString(),
    unitId: dbmsUnit1._id.toString(),
  });
  await resourceController.getResources(fullFlowReqRes.req, fullFlowReqRes.res);

  if (fullFlowReqRes.res.statusCode !== 200) {
    throw new Error(`getResources failed with status ${fullFlowReqRes.res.statusCode}`);
  }
  const flowResult = fullFlowReqRes.res.jsonData;
  console.log(`   Flow returned ${flowResult.count} resources.`);
  if (flowResult.data.length === 0) {
    throw new Error('Full flow query returned 0 resources!');
  }
  const targetResource = flowResult.data[0];
  console.log('   Retrieved Target Resource:', {
    title: targetResource.title,
    source: targetResource.source,
    academicYear: targetResource.academicYear,
    subject: targetResource.subjectId?.name,
    unitNumber: targetResource.unitId?.unitNumber,
  });

  if (targetResource._id.toString() !== testResource._id.toString()) {
    throw new Error('Retrieved resource ID does not match expected target resource!');
  }

  console.log('\n=============================================================================');
  console.log('      ✓ COMPLETE NOTES FLOW TESTED & VERIFIED SUCCESSFULLY!                  ');
  console.log('=============================================================================\n');

  process.exit(0);
}

testNotesFlow().catch((err) => {
  console.error('\n❌ NOTES FLOW TEST FAILED:', err.message);
  process.exit(1);
});
