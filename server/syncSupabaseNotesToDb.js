const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'pdf-notes';

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive Subject Mapping Dictionary
const SUBJECT_MAP = {
  // 1st Year
  MATH1: { name: 'Engineering Mathematics-I', code: 'MATH1', year: '1st Year' },
  'ENGINEERING MATHEMATICS-I': { name: 'Engineering Mathematics-I', code: 'MATH1', year: '1st Year' },
  MATH2: { name: 'Engineering Mathematics-II', code: 'MATH2', year: '1st Year' },
  'ENGINEERING MATHEMATICS-II': { name: 'Engineering Mathematics-II', code: 'MATH2', year: '1st Year' },
  PHYSICS: { name: 'Engineering Physics', code: 'PHYSICS', year: '1st Year' },
  'ENGINEERING PHYSICS': { name: 'Engineering Physics', code: 'PHYSICS', year: '1st Year' },
  DS: { name: 'Data Structure', code: 'DS', year: '1st Year' },
  'DATA STRUCTURE': { name: 'Data Structure', code: 'DS', year: '1st Year' },
  PYTHON: { name: 'Python Programming', code: 'PYTHON', year: '1st Year' },
  'PYTHON PROGRAMMING': { name: 'Python Programming', code: 'PYTHON', year: '1st Year' },
  TC: { name: 'Technical Communication', code: 'TC', year: '1st Year' },
  'TECHNICAL COMMUNICATION': { name: 'Technical Communication', code: 'TC', year: '1st Year' },

  // 2nd Year
  ED: { name: 'Electronic Devices', code: 'ED', year: '2nd Year' },
  'ELECTRONIC DEVICE': { name: 'Electronic Devices', code: 'ED', year: '2nd Year' },
  'ELECTRONIC DEVICES': { name: 'Electronic Devices', code: 'ED', year: '2nd Year' },
  FM: { name: 'Fluid Mechanics', code: 'FM', year: '2nd Year' },
  'FLUID MECHANICS': { name: 'Fluid Mechanics', code: 'FM', year: '2nd Year' },
  MATH4: { name: 'Engineering Mathematics-IV', code: 'MATH4', year: '2nd Year' },
  'MATH 4': { name: 'Engineering Mathematics-IV', code: 'MATH4', year: '2nd Year' },
  NAS: { name: 'Network Analysis and Synthesis', code: 'NAS', year: '2nd Year' },
  'NETWORK ANALOGY AND SYNTHESIS': { name: 'Network Analysis and Synthesis', code: 'NAS', year: '2nd Year' },
  COA: { name: 'Computer Organization & Architecture', code: 'COA', year: '2nd Year' },
  COI: { name: 'Constitution of India', code: 'COI', year: '2nd Year' },
  'COMPUTER GRAPHICS': { name: 'Computer Graphics', code: 'CG', year: '2nd Year' },
  DAA: { name: 'Design and Analysis of Algorithm', code: 'DAA', year: '2nd Year' },
  'DESIGN AND ANALYSIS OF ALGORITHMS': { name: 'Design and Analysis of Algorithm', code: 'DAA', year: '2nd Year' },
  DBMS: { name: 'Database Management System', code: 'DBMS', year: '2nd Year' },
  DM: { name: 'Discrete Mathematics', code: 'DM', year: '2nd Year' },
  EITK: { name: 'Essence of Indian Traditional Knowledge', code: 'EITK', year: '2nd Year' },
  OOSD: { name: 'Object Oriented Software Design', code: 'OOSD', year: '2nd Year' },
  OS: { name: 'Operating System', code: 'OS', year: '2nd Year' },
  SE: { name: 'Software Engineering', code: 'SE', year: '2nd Year' },
  TAFL: { name: 'Theory of Automata and Formal Languages', code: 'TAFL', year: '2nd Year' },
  'THEORY OF AUTOMATA AND FORMAL LANGUAGES': { name: 'Theory of Automata and Formal Languages', code: 'TAFL', year: '2nd Year' },

  // 3rd Year
  AI: { name: 'Artificial Intelligence', code: 'AI', year: '3rd Year' },
  ANDROID: { name: 'Android Application Development', code: 'ANDROID', year: '3rd Year' },
  'APPLICATION OF SOFT COMPUTING': { name: 'Application of Soft Computing', code: 'ASC', year: '3rd Year' },
  CN: { name: 'Computer Networks', code: 'CN', year: '3rd Year' },
  CD: { name: 'Compiler Design', code: 'CD', year: '3rd Year' },
  CYBER: { name: 'Cyber Security & Digital Forensics', code: 'CYBER', year: '3rd Year' },
  IOT: { name: 'Internet of Things', code: 'IOT', year: '3rd Year' },
  MLT: { name: 'Machine Learning Techniques', code: 'MLT', year: '3rd Year' },
  WT: { name: 'Web Technology', code: 'WT', year: '3rd Year' },
  'WEB TECHNOLOGY': { name: 'Web Technology', code: 'WT', year: '3rd Year' },

  // 4th Year
  'BIG DATA': { name: 'Big Data Analytics', code: 'BIGDATA', year: '4th Year' },
  CLOUD: { name: 'Cloud Computing', code: 'CLOUD', year: '4th Year' },
  SPM: { name: 'Software Project Management', code: 'SPM', year: '4th Year' },
};

function getSubjectInfo(subjectFolderOrName, academicYearHint) {
  if (!subjectFolderOrName) return { name: 'General Engineering', code: 'GEN', year: academicYearHint || '1st Year' };
  const upper = subjectFolderOrName.trim().toUpperCase();

  if (SUBJECT_MAP[upper]) {
    const res = { ...SUBJECT_MAP[upper] };
    if (academicYearHint) res.year = academicYearHint;
    return res;
  }

  for (const [key, val] of Object.entries(SUBJECT_MAP)) {
    if (upper === key || upper.includes(key) || key.includes(upper)) {
      const res = { ...val };
      if (academicYearHint) res.year = academicYearHint;
      return res;
    }
  }

  const cleanCode = upper.replace(/[^A-Z0-9]/g, '_').substring(0, 10);
  return {
    name: subjectFolderOrName.trim(),
    code: cleanCode || 'GEN',
    year: academicYearHint || '3rd Year',
  };
}

function parseUnitNumber(filenameStr) {
  const match = filenameStr.match(/(?:unit|u)[-_\s]*([1-5])/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 1;
}

function parsePaperYear(filenameStr) {
  const match = filenameStr.match(/(20\d{2}|\b[12]\d\b)/);
  if (match && match[1]) {
    let yr = parseInt(match[1], 10);
    if (yr < 100) yr += 2000;
    if (yr >= 2015 && yr <= 2030) return yr;
  }
  return 2024;
}

function parseSource(fullPath) {
  const lower = fullPath.toLowerCase();
  if (lower.includes('edushine')) return 'EduShine Classes';
  if (lower.includes('gateway')) return 'Gateway Classes';
  if (lower.includes('multi atom') || lower.includes('multiatom') || lower.includes('multi-atom')) return 'Multi Atom';
  if (lower.includes('rrsimt')) return 'RRSIMT Classes';
  if (lower.includes('i tech world') || lower.includes('itechworld')) return 'I Tech World';
  if (lower.startsWith('other notes')) return 'Other Notes';
  if (lower.startsWith('pyqs') || lower.startsWith('pyq')) return 'AKTU PYQs';
  if (lower.startsWith('syllabus')) return 'AKTU Syllabus';
  return 'EduShine Classes';
}

function parseYearFromPath(fullPath) {
  const match = fullPath.match(/([1-4])\s*(?:st|nd|rd|th)?[-_\s]*(?:Year|Yr)/i);
  if (match && match[1]) {
    const canonicalMap = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year',
    };
    return canonicalMap[match[1]] || null;
  }
  return null;
}

function cleanTitleWithAI(rawTitle, subjectName, unitNum, type, pathStr) {
  let title = rawTitle;

  if (type === 'syllabus' || pathStr.toLowerCase().startsWith('syllabus')) {
    if (pathStr.includes('1st year') || pathStr.includes('1st_year') || title.includes('1st year') || title.includes('1st_year')) {
      return 'AKTU B.Tech 1st Year Official Syllabus';
    }
    if (pathStr.includes('2nd_Year') || pathStr.includes('2nd_Yr') || pathStr.includes('2nd Year') || title.includes('2nd_Year') || title.includes('2nd_Yr')) {
      return 'AKTU B.Tech 2nd Year CSE Official Syllabus';
    }
    if (pathStr.includes('3rd Year') || pathStr.includes('3rd_Year') || title.includes('3rd Year') || title.includes('3rd_Year')) {
      return 'AKTU B.Tech 3rd Year CSE Official Syllabus (2024-25)';
    }
    if (pathStr.includes('4th Year') || pathStr.includes('4th_Year') || title.includes('4th Year') || title.includes('4th_Year')) {
      return 'AKTU B.Tech 4th Year CSE Official Syllabus (2025-26)';
    }
    return `AKTU ${subjectName} Official Syllabus`;
  }

  if (type === 'pyq' || pathStr.toLowerCase().startsWith('pyqs')) {
    const yr = parsePaperYear(rawTitle);
    return `${subjectName} ${yr} Previous Year Question Paper (PYQ)`;
  }

  // Remove noise & compression tags
  title = title
    .replace(/\.pdf$/i, '')
    .replace(/\(\d+\)/g, '')
    .replace(/_compressed/gi, '')
    .replace(/_merged/gi, '')
    .replace(/ - converted/gi, '')
    .replace(/by[-_\s]*multiatoms?/gi, '')
    .replace(/by[-_\s]*multi[-_\s]*atoms?/gi, '')
    .replace(/by[-_\s]*rrsimt(\s*classes)?/gi, '')
    .replace(/by[-_\s]*edushine(\s*classes)?/gi, '')
    .replace(/by[-_\s]*i\s*tech\s*world/gi, '')
    .replace(/\(rrsimt\s*classes\)/gi, '')
    .replace(/\(edushine\s*classes\)/gi, '')
    .replace(/rrsimt\s*classes/gi, '')
    .replace(/edushine\s*classes/gi, '')
    .replace(/multiatoms?/gi, '')
    .replace(/multi\s*atoms?/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[-_]{2,}/g, ' ')
    .trim();

  // Extract unit info
  let unitText = '';
  const unitMatch = rawTitle.match(/(?:unit|u)[-_\s]*([1-5](?:\s*[-&to,]\s*[1-5])?)/i);
  if (unitMatch) {
    const matchedUnit = unitMatch[1];
    if (matchedUnit.includes('-') || matchedUnit.includes('&') || matchedUnit.includes('to')) {
      unitText = `Units ${matchedUnit}`;
    } else {
      unitText = `Unit ${matchedUnit}`;
    }
    title = title.replace(/(?:unit|u)[-_\s]*[1-5](?:\s*[-&to,]\s*[1-5])?/gi, '').trim();
  } else if (unitNum) {
    unitText = `Unit ${unitNum}`;
  }

  const isOneShot = /one[-_\s]*shot/i.test(rawTitle);
  const isImportant = /v\.?imp|important/i.test(rawTitle);

  title = title
    .replace(/one[-_\s]*shot/gi, '')
    .replace(/v\.?imp\s*ques(\s*\+\s*topics)?/gi, '')
    .replace(/important\s*questions?/gi, '')
    .replace(/complete\s*notes/gi, '')
    .replace(/easy\s*notes/gi, '')
    .replace(/full\s*notes/gi, '')
    .replace(/class\s*notes/gi, '')
    .replace(/short\s*notes/gi, '')
    .replace(/notes/gi, '')
    .replace(/BCS\d+/gi, '')
    .replace(/BAS\d+/gi, '')
    .replace(/BOE\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let mainName = title.length > 2 ? title : subjectName;
  if (mainName.toLowerCase() === subjectName.toLowerCase()) {
    mainName = subjectName;
  }

  let finalTag = 'Notes';
  if (isOneShot) finalTag = 'One-Shot Notes';
  else if (isImportant) finalTag = 'Important Questions';
  else finalTag = 'Notes';

  let result = mainName;
  if (unitText && !result.toLowerCase().includes(unitText.toLowerCase())) {
    result += ` ${unitText}`;
  }
  if (!result.toLowerCase().includes(finalTag.toLowerCase())) {
    result += ` ${finalTag}`;
  }

  return result.replace(/\s+/g, ' ').trim();
}

async function listAllFilesRecursively(dirPath = '') {
  let filesList = [];
  const { data, error } = await supabase.storage.from(bucketName).list(dirPath, { limit: 1000 });
  if (error || !data) {
    if (error) console.error(`Error listing '${dirPath}':`, error.message);
    return filesList;
  }

  for (const item of data) {
    const itemPath = dirPath ? `${dirPath}/${item.name}` : item.name;
    if (!item.id || !item.metadata) {
      const subFiles = await listAllFilesRecursively(itemPath);
      filesList = filesList.concat(subFiles);
    } else if (item.name.toLowerCase().endsWith('.pdf')) {
      filesList.push({
        path: itemPath,
        name: item.name,
        size: item.metadata?.size
      });
    }
  }
  return filesList;
}

async function syncSupabaseToDb(options = {}) {
  const silent = options.silent || false;
  if (!silent) console.log('=== STARTING SUPABASE STORAGE TO MONGO-DB SYNC ===\n');

  await connectDB();

  if (!silent) console.log(`Fetching all files recursively from Supabase bucket '${bucketName}' ...`);
  const allPdfFiles = await listAllFilesRecursively('');
  if (!silent) console.log(`Found ${allPdfFiles.length} PDF files in Supabase Storage.\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const pdfItem of allPdfFiles) {
    const pathParts = pdfItem.path.split('/');
    const lowerPath = pdfItem.path.toLowerCase();
    const isSyllabus = lowerPath.startsWith('syllabus');
    const isPYQ = lowerPath.startsWith('pyqs') || lowerPath.startsWith('pyq');

    let academicYearHint = parseYearFromPath(pdfItem.path);
    let subjectFolderName = 'General';

    if (isSyllabus) {
      subjectFolderName = 'Syllabus';
    } else if (isPYQ) {
      // PYQS / 1st Year / SubjectName / File.pdf
      if (pathParts.length >= 3) {
        subjectFolderName = pathParts[2];
      } else if (pathParts.length === 2) {
        subjectFolderName = pathParts[1];
      }
    } else if (pathParts[0].toLowerCase() === 'other notes') {
      // Other Notes / SubjectName / File.pdf
      subjectFolderName = pathParts[1] || 'General';
    } else if (pathParts.length >= 4) {
      // Source / Year / Subject / File.pdf
      subjectFolderName = pathParts[2];
    } else if (pathParts.length === 3) {
      // Source or Year / Subject / File.pdf
      subjectFolderName = pathParts[1];
    } else if (pathParts.length === 2) {
      subjectFolderName = pathParts[0];
    }

    const subjectInfo = getSubjectInfo(subjectFolderName, academicYearHint);
    let resourceType = 'notes';
    if (isSyllabus) resourceType = 'syllabus';
    else if (isPYQ) resourceType = 'pyq';

    const sourceName = parseSource(pdfItem.path);
    const unitNum = (isSyllabus || isPYQ) ? 1 : parseUnitNumber(pdfItem.name);
    const paperYr = isPYQ ? parsePaperYear(pdfItem.name) : null;
    const aiTitle = cleanTitleWithAI(pdfItem.name, subjectInfo.name, unitNum, resourceType, pdfItem.path);

    // 1. Get or Create Subject in DB
    let subject = await Subject.findOne({ code: subjectInfo.code });
    if (!subject) {
      subject = await Subject.create({
        name: subjectInfo.name,
        code: subjectInfo.code,
        description: `${subjectInfo.name} complete study notes and academic materials.`,
        academicYear: subjectInfo.year,
      });
      if (!silent) console.log(`[Subject Created] ${subject.name} (${subject.code}) - ${subject.academicYear}`);
    }

    // 2. Get or Create Unit for Subject (if notes)
    let unit = null;
    if (!isSyllabus && !isPYQ) {
      unit = await Unit.findOne({ subjectId: subject._id, unitNumber: unitNum });
      if (!unit) {
        unit = await Unit.create({
          subjectId: subject._id,
          unitNumber: unitNum,
          title: `${subject.name} Unit ${unitNum}`,
          description: `Unit ${unitNum} comprehensive study notes for ${subject.name}`,
        });
      }
    }

    // 3. Storage fileUrl relative path
    const fileUrl = pdfItem.path;

    // 4. Check if Resource already exists in MongoDB
    const existing = await Resource.findOne({
      $or: [
        { fileUrl: fileUrl },
        { fileUrl: `/${fileUrl}` }
      ]
    });

    if (!existing) {
      await Resource.create({
        title: aiTitle,
        description: isSyllabus
          ? `${subject.name} Official Syllabus (${subjectInfo.year})`
          : isPYQ
          ? `${subject.name} ${paperYr} PYQ Paper`
          : `${subject.name} - Unit ${unitNum} Study Notes (${sourceName})`,
        type: resourceType,
        source: sourceName,
        academicYear: subjectInfo.year,
        paperYear: paperYr,
        subjectId: subject._id,
        unitId: unit ? unit._id : undefined,
        fileUrl: fileUrl,
        tags: isSyllabus
          ? [subject.name, 'Syllabus', subjectInfo.year]
          : isPYQ
          ? [subject.name, 'PYQ', String(paperYr), subjectInfo.year]
          : [subject.name, `Unit ${unitNum}`, sourceName, 'Notes'],
      });
      insertedCount++;
      if (!silent) console.log(`   + Added Resource: "${aiTitle}" [${subjectInfo.code}] (${subjectInfo.year}) -> ${fileUrl}`);
    } else {
      let needsSave = false;
      if (existing.fileUrl !== fileUrl) {
        existing.fileUrl = fileUrl;
        needsSave = true;
      }
      if (existing.title !== aiTitle) {
        existing.title = aiTitle;
        needsSave = true;
      }
      if (existing.academicYear !== subjectInfo.year) {
        existing.academicYear = subjectInfo.year;
        needsSave = true;
      }
      if (existing.source !== sourceName) {
        existing.source = sourceName;
        needsSave = true;
      }
      if (isPYQ && existing.paperYear !== paperYr) {
        existing.paperYear = paperYr;
        needsSave = true;
      }
      if (needsSave) {
        await existing.save();
        updatedCount++;
        if (!silent) console.log(`   🔄 Updated Resource: "${aiTitle}" [${subjectInfo.code}] -> ${fileUrl}`);
      } else {
        skippedCount++;
      }
    }
  }

  const totalCount = await Resource.countDocuments();
  if (!silent) {
    console.log('\n=== SUPABASE TO MONGO-DB SYNC COMPLETE ===');
    console.log(`✅ Newly Inserted: ${insertedCount}`);
    console.log(`🔄 Updated Paths: ${updatedCount}`);
    console.log(`⚡ Existing / Unchanged: ${skippedCount}`);
    console.log(`📚 Total Resources in Database: ${totalCount}\n`);
  } else if (insertedCount > 0 || updatedCount > 0) {
    console.log(`[Supabase Auto-Sync] Sync complete. Newly Inserted: ${insertedCount}, Updated: ${updatedCount}. Total DB Resources: ${totalCount}`);
  }

  return { success: true, insertedCount, updatedCount, skippedCount, totalCount };
}

module.exports = { syncSupabaseToDb };

if (require.main === module) {
  syncSupabaseToDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Sync Error]', err);
      process.exit(1);
    });
}
