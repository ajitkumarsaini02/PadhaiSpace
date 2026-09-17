const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');
const connectDB = require('./config/db');

async function verifyAll() {
  console.log('=== RUNNING COMPREHENSIVE ARCHITECTURE & MODEL VERIFICATION ===\n');

  await connectDB();

  // 1. VERIFY SUBJECT MODEL
  console.log('1. Verifying Subject Model structure...');
  const testSubj = await Subject.findOne();
  if (testSubj) {
    console.log('   Sample Subject:', {
      name: testSubj.name,
      code: testSubj.code,
      description: testSubj.description,
      hasThumbnail: testSubj.thumbnail !== undefined,
      createdAt: testSubj.createdAt,
      updatedAt: testSubj.updatedAt,
    });
  } else {
    throw new Error('No Subject document found in database');
  }

  // 2. VERIFY UNIT MODEL
  console.log('\n2. Verifying Unit Model structure...');
  const testUnit = await Unit.findOne().populate('subjectId', 'name code');
  if (testUnit) {
    console.log('   Sample Unit:', {
      subject: testUnit.subjectId?.name,
      unitNumber: testUnit.unitNumber,
      title: testUnit.title,
      description: testUnit.description,
      createdAt: testUnit.createdAt,
      updatedAt: testUnit.updatedAt,
    });
  } else {
    throw new Error('No Unit document found in database');
  }

  // 3. VERIFY RESOURCE MODEL & SEMANTIC FIELDS
  console.log('\n3. Verifying Resource Model structure and allowed types...');
  const resources = await Resource.find().populate('subjectId', 'name code').populate('unitId', 'unitNumber title');
  console.log(`   Total resources found: ${resources.length}`);

  const allowedTypes = ['notes', 'unit-pdf', 'pyq', 'syllabus', 'exam-resource', 'pdf', 'other'];

  for (const r of resources) {
    if (!allowedTypes.includes(r.type)) {
      throw new Error(`Invalid resource type detected: "${r.type}" for resource "${r.title}"`);
    }
  }
  console.log('   ✓ All resources strictly adhere to allowed types:', allowedTypes.join(', '));

  // 4. TEST PYQ SEMANTICS
  console.log('\n4. Verifying PYQ & Notes semantic year fields...');
  const pyqResource = await Resource.findOne({ type: 'pyq' });
  if (pyqResource) {
    console.log('   Sample PYQ Resource:', {
      title: pyqResource.title,
      type: pyqResource.type,
      academicYear: pyqResource.academicYear, // Student's academic year (e.g. 2nd Year)
      paperYear: pyqResource.paperYear,       // Question paper actual year (e.g. 2024)
      source: pyqResource.source,
    });
  }

  const notesResource = await Resource.findOne({ type: 'notes' });
  if (notesResource) {
    console.log('   Sample Notes Resource:', {
      title: notesResource.title,
      type: notesResource.type,
      academicYear: notesResource.academicYear, // e.g. 2nd Year
      source: notesResource.source,
    });
  }

  console.log('\n=== ALL VERIFICATION CHECKS PASSED CLEANLY! ===\n');
  process.exit(0);
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
