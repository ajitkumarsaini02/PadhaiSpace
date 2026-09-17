const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');

async function testPYQFlow() {
  console.log('=============================================================================');
  console.log('            TESTING COMPLETE PYQ ARCHITECTURE & FLOW                          ');
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

  // 1. Setup DBMS Subject & Sample 2025 PYQ
  console.log('Step 1: Setting up DBMS Subject & Sample 2nd Year 2025 PYQ Resource...');
  const dbmsSubject = await Subject.findOneAndUpdate(
    { code: 'BCS501' },
    { name: 'Database Management System', code: 'BCS501', description: 'ER Models, SQL, Normalization' },
    { upsert: true, new: true }
  );

  const testPYQ = await Resource.findOneAndUpdate(
    { title: 'DBMS 2nd Year 2025 End-Semester Exam Paper' },
    {
      title: 'DBMS 2nd Year 2025 End-Semester Exam Paper',
      description: 'Official 2025 End Semester Question Paper for DBMS with answer key',
      type: 'pyq',
      academicYear: '2nd Year',
      paperYear: 2025,
      subjectId: dbmsSubject._id,
      source: 'AKTU Archive',
      fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
      tags: ['PYQ', 'DBMS', '2025', '2nd Year'],
    },
    { upsert: true, new: true }
  );
  console.log(`   ✓ Sample 2025 PYQ created with ID: ${testPYQ._id}`);

  // 2. Test GET /api/resources/meta/paper-years?academicYear=2nd Year&type=pyq
  console.log('\nStep 2: Testing GET /api/resources/meta/paper-years (Dynamic MongoDB paper years for 2nd Year)...');
  const paperYearsReqRes = makeReqRes({ academicYear: '2nd Year', type: 'pyq' });
  await resourceController.getPaperYears(paperYearsReqRes.req, paperYearsReqRes.res);

  if (paperYearsReqRes.res.statusCode !== 200) {
    throw new Error(`getPaperYears failed with status ${paperYearsReqRes.res.statusCode}`);
  }
  const paperYearsData = paperYearsReqRes.res.jsonData.data;
  console.log('   Dynamic MongoDB Paper Years for 2nd Year:', paperYearsData);
  if (!paperYearsData.includes(2025)) {
    throw new Error('Expected 2025 to be in dynamic MongoDB paper years array!');
  }
  console.log('   ✓ PASS: Paper year 2025 dynamically retrieved from MongoDB!');

  // 3. Test GET /api/resources/meta/pyq-subjects?academicYear=2nd Year&paperYear=2025
  console.log('\nStep 3: Testing GET /api/resources/meta/pyq-subjects (Subjects with PYQs for 2nd Year 2025)...');
  const pyqSubjReqRes = makeReqRes({ academicYear: '2nd Year', paperYear: '2025' });
  await resourceController.getPYQSubjects(pyqSubjReqRes.req, pyqSubjReqRes.res);

  if (pyqSubjReqRes.res.statusCode !== 200) {
    throw new Error(`getPYQSubjects failed with status ${pyqSubjReqRes.res.statusCode}`);
  }
  const pyqSubjectsData = pyqSubjReqRes.res.jsonData.data;
  console.log('   Subjects found for 2nd Year 2025 PYQs:', pyqSubjectsData.map(s => `${s.name} (${s.code})`));
  const foundDBMS = pyqSubjectsData.find(s => s._id.toString() === dbmsSubject._id.toString());
  if (!foundDBMS) {
    throw new Error('DBMS subject not found in PYQ subjects list for 2nd Year 2025!');
  }
  console.log(`   ✓ PASS: DBMS Subject (${foundDBMS.name}) dynamically verified in database!`);

  // 4. Test Complete Flow: PYQs -> 2nd Year -> 2025 -> DBMS -> PYQ PDF
  console.log('\nStep 4: Executing Full PYQ Flow Query (academicYear=2nd Year, paperYear=2025, subjectId=DBMS)...');
  const fullFlowReqRes = makeReqRes({
    type: 'pyq',
    academicYear: '2nd Year',
    paperYear: '2025',
    subjectId: dbmsSubject._id.toString(),
  });
  await resourceController.getResources(fullFlowReqRes.req, fullFlowReqRes.res);

  if (fullFlowReqRes.res.statusCode !== 200) {
    throw new Error(`getResources failed with status ${fullFlowReqRes.res.statusCode}`);
  }
  const flowResult = fullFlowReqRes.res.jsonData;
  console.log(`   Query returned ${flowResult.count} PYQs.`);
  if (flowResult.data.length === 0) {
    throw new Error('Full PYQ flow query returned 0 resources!');
  }

  const pyqDoc = flowResult.data[0];
  console.log('   Retrieved PYQ Document:', {
    title: pyqDoc.title,
    type: pyqDoc.type,
    academicYear: pyqDoc.academicYear,
    paperYear: pyqDoc.paperYear,
    subject: pyqDoc.subjectId?.name,
    fileUrl: pyqDoc.fileUrl,
  });

  if (pyqDoc.academicYear !== '2nd Year' || pyqDoc.paperYear !== 2025) {
    throw new Error(`Invalid year attributes on returned document: academicYear=${pyqDoc.academicYear}, paperYear=${pyqDoc.paperYear}`);
  }

  console.log('\n=============================================================================');
  console.log('      ✓ COMPLETE PYQ FLOW TESTED & VERIFIED SUCCESSFULLY!                    ');
  console.log('=============================================================================\n');

  process.exit(0);
}

testPYQFlow().catch((err) => {
  console.error('\n❌ PYQ FLOW TEST FAILED:', err.message);
  process.exit(1);
});
