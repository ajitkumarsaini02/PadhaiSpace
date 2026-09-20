const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');

// Subject code to Full Name mapping dictionary
const SUBJECT_MAP = {
  AI: { name: 'Artificial Intelligence', code: 'AI', year: '3rd Year' },
  Android: { name: 'Android Application Development', code: 'ANDROID', year: '3rd Year' },
  'Big Data': { name: 'Big Data Analytics', code: 'BIGDATA', year: '4th Year' },
  CN: { name: 'Computer Networks', code: 'CN', year: '3rd Year' },
  COA: { name: 'Computer Organization & Architecture', code: 'COA', year: '2nd Year' },
  COI: { name: 'Constitution of India', code: 'COI', year: '2nd Year' },
  'Cloud Computing': { name: 'Cloud Computing', code: 'CLOUD', year: '4th Year' },
  'Compiler Design': { name: 'Compiler Design', code: 'CD', year: '3rd Year' },
  'Computer Graphics': { name: 'Computer Graphics', code: 'CG', year: '2nd Year' },
  'Cyber Security': { name: 'Cyber Security & Digital Forensics', code: 'CYBER', year: '3rd Year' },
  DAA: { name: 'Design and Analysis of Algorithm', code: 'DAA', year: '2nd Year' },
  DBMS: { name: 'Database Management System', code: 'DBMS', year: '2nd Year' },
  DM: { name: 'Discrete Mathematics', code: 'DM', year: '2nd Year' },
  DS: { name: 'Data Structure', code: 'DS', year: '1st Year' },
  'Data Science': { name: 'Data Science & Analytics', code: 'DS-SCI', year: '3rd Year' },
  EITK: { name: 'Essence of Indian Traditional Knowledge', code: 'EITK', year: '2nd Year' },
  IoT: { name: 'Internet of Things', code: 'IOT', year: '3rd Year' },
  MLT: { name: 'Machine Learning Techniques', code: 'MLT', year: '3rd Year' },
  OOSD: { name: 'Object Oriented Software Design', code: 'OOSD', year: '2nd Year' },
  OS: { name: 'Operating System', code: 'OS', year: '2nd Year' },
  Placement: { name: 'Placement Preparation & Aptitude', code: 'PLACEMENT', year: '4th Year' },
  Python: { name: 'Python Programming', code: 'PYTHON', year: '1st Year' },
  SE: { name: 'Software Engineering', code: 'SE', year: '2nd Year' },
  SPM: { name: 'Software Project Management', code: 'SPM', year: '4th Year' },
  TAFL: { name: 'Theory of Automata and Formal Languages', code: 'TAFL', year: '2nd Year' },
  TC: { name: 'Technical Communication', code: 'TC', year: '1st Year' },
  UHV: { name: 'Universal Human Values', code: 'UHV', year: '2nd Year' },
  WT: { name: 'Web Technology', code: 'WT', year: '3rd Year' },
  'Wireless Communication': { name: 'Wireless Communication', code: 'WIRELESS', year: '4th Year' },
};

function parseUnitNumber(filenameStr) {
  const match = filenameStr.match(/(?:unit|u)[-_\s]*([1-5])/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 1; // Default to Unit 1 if not explicitly numbered
}

function parseSource(folderOrFilename) {
  const lower = folderOrFilename.toLowerCase();
  if (lower.includes('edushine')) return 'EduShine Classes';
  if (lower.includes('gateway')) return 'Gateway Classes';
  if (lower.includes('multi atom') || lower.includes('multiatom')) return 'Multi Atom';
  if (lower.includes('rrsimt')) return 'RRSIMT Classes';
  return 'Gateway Classes'; // Default provider
}

function getAllPdfFilesRecursively(dirPath, rootDir) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const list = fs.readdirSync(dirPath);
  list.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllPdfFilesRecursively(fullPath, rootDir));
    } else if (file.toLowerCase().endsWith('.pdf')) {
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      results.push({
        fullPath,
        relPath: `/uploads/${relPath}`,
        filename: file,
      });
    }
  });
  return results;
}

async function syncNotes() {
  console.log('=== STARTING AUTOMATIC DISK NOTES TO MONGO-DB SYNC ===\n');

  await connectDB();

  const notesRootDir = path.join(__dirname, 'protected_uploads', 'Notes');
  if (!fs.existsSync(notesRootDir)) {
    console.error(`[Sync Error] Directory missing: ${notesRootDir}`);
    process.exit(1);
  }

  const subjectFolders = fs.readdirSync(notesRootDir).filter((f) => {
    return fs.statSync(path.join(notesRootDir, f)).isDirectory();
  });

  console.log(`Found ${subjectFolders.length} subject folders in protected_uploads/Notes/\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const folderName of subjectFolders) {
    const folderPath = path.join(notesRootDir, folderName);
    const subjectInfo = SUBJECT_MAP[folderName] || {
      name: folderName,
      code: folderName.toUpperCase().replace(/\s+/g, '_'),
      year: '3rd Year',
    };

    // 1. Get or Create Subject in DB
    let subject = await Subject.findOne({ code: subjectInfo.code });
    if (!subject) {
      subject = await Subject.create({
        name: subjectInfo.name,
        code: subjectInfo.code,
        description: `${subjectInfo.name} complete study notes and academic materials.`,
        academicYear: subjectInfo.year,
      });
      console.log(`[Subject Created] ${subject.name} (${subject.code}) - ${subject.academicYear}`);
    }

    // 2. Fetch all PDF files inside folder recursively
    const pdfFiles = getAllPdfFilesRecursively(folderPath, path.join(__dirname, 'protected_uploads'));
    console.log(` 📁 Subject: ${subject.name} (${pdfFiles.length} PDF files found)`);

    for (const pdfItem of pdfFiles) {
      const unitNum = parseUnitNumber(pdfItem.filename);
      const sourceName = parseSource(pdfItem.fullPath);
      const cleanTitle = pdfItem.filename.replace(/\.pdf$/i, '').trim();

      // 3. Get or Create Unit for Subject
      let unit = await Unit.findOne({ subjectId: subject._id, unitNumber: unitNum });
      if (!unit) {
        unit = await Unit.create({
          subjectId: subject._id,
          unitNumber: unitNum,
          title: `${subject.name} Unit ${unitNum}`,
          description: `Unit ${unitNum} comprehensive study notes for ${subject.name}`,
        });
      }

      // 4. Check if Resource already exists in MongoDB by fileUrl
      const existing = await Resource.findOne({
        $or: [{ fileUrl: pdfItem.relPath }, { title: cleanTitle, subjectId: subject._id }],
      });

      if (!existing) {
        await Resource.create({
          title: cleanTitle,
          description: `${subject.name} - Unit ${unitNum} Study Notes (${sourceName})`,
          type: 'notes',
          source: sourceName,
          academicYear: subjectInfo.year,
          subjectId: subject._id,
          unitId: unit._id,
          fileUrl: pdfItem.relPath,
          tags: [subject.name, `Unit ${unitNum}`, sourceName, 'Notes'],
        });
        insertedCount++;
        console.log(`   + Added Resource: "${cleanTitle}" -> ${pdfItem.relPath}`);
      } else {
        // Ensure fileUrl is up to date
        if (existing.fileUrl !== pdfItem.relPath) {
          existing.fileUrl = pdfItem.relPath;
          await existing.save();
          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    }
  }

  console.log('\n=== MONGO-DB SYNC COMPLETE ===');
  console.log(`✅ Newly Inserted: ${insertedCount}`);
  console.log(`🔄 Updated Paths: ${updatedCount}`);
  console.log(`⚡ Existing / Unchanged: ${skippedCount}`);
  console.log(`📚 Total Resources in Database: ${await Resource.countDocuments()}\n`);

  process.exit(0);
}

syncNotes().catch((err) => {
  console.error('[Sync Failure]', err);
  process.exit(1);
});
