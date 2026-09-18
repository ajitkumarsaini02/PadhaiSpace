const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Resource = require('./models/Resource');
const Subject = require('./models/Subject');

async function checkAndCleanDuplicates(autoRemove = false) {
  console.log('=== CHECKING FOR DUPLICATE RESOURCES IN MONGO-DB & DISK ===\n');

  await connectDB();

  const resources = await Resource.find().populate('subjectId', 'name code');
  console.log(`Total Resources in DB: ${resources.length}\n`);

  // 1. Group by fileUrl
  const fileUrlMap = {};
  resources.forEach((r) => {
    if (!r.fileUrl) return;
    const cleanUrl = r.fileUrl.toLowerCase();
    if (!fileUrlMap[cleanUrl]) fileUrlMap[cleanUrl] = [];
    fileUrlMap[cleanUrl].push(r);
  });

  const duplicateFileUrls = Object.keys(fileUrlMap).filter((url) => fileUrlMap[url].length > 1);
  console.log(`1. Duplicate fileUrl entries: ${duplicateFileUrls.length}`);

  let removedByUrlCount = 0;
  for (const url of duplicateFileUrls) {
    const list = fileUrlMap[url];
    console.log(`   - Duplicate URL (${list.length} copies): ${url}`);
    // Keep the first one, mark others for removal
    const [keep, ...removeList] = list;
    for (const item of removeList) {
      if (autoRemove) {
        await Resource.findByIdAndDelete(item._id);
        removedByUrlCount++;
      }
    }
  }

  // 2. Group by Normalized Title + SubjectId
  const titleMap = {};
  const allCurrent = await Resource.find().populate('subjectId', 'name code');
  allCurrent.forEach((r) => {
    // Normalize title (remove trailing numbers, copies, extension, (1), (2), _copy, whitespace)
    const normTitle = r.title
      .toLowerCase()
      .replace(/[\(\[\{]\d+[\)\]\}]/g, '')
      .replace(/_copy/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const subjIdStr = r.subjectId?._id?.toString() || 'nosubject';
    const key = `${subjIdStr}::${normTitle}`;

    if (!titleMap[key]) titleMap[key] = [];
    titleMap[key].push(r);
  });

  const duplicateTitles = Object.keys(titleMap).filter((key) => titleMap[key].length > 1);
  console.log(`\n2. Duplicate / Similar Title entries: ${duplicateTitles.length}`);

  let removedByTitleCount = 0;
  for (const key of duplicateTitles) {
    const list = titleMap[key];
    const [subj, title] = key.split('::');
    console.log(`   - Duplicate Title [${list[0].subjectId?.name || 'Subject'}]: "${list[0].title}" (${list.length} instances)`);
    list.forEach((item, idx) => {
      console.log(`     [${idx + 1}] ID: ${item._id} | File: ${item.fileUrl}`);
    });

    if (autoRemove) {
      // Keep the one with highest views/downloads or cleaner path, delete others
      const sorted = [...list].sort((a, b) => {
        if (a.views !== b.views) return b.views - a.views;
        return a.fileUrl.length - b.fileUrl.length; // prefer shorter, cleaner fileUrl
      });
      const [keepItem, ...toDelete] = sorted;

      for (const delItem of toDelete) {
        await Resource.findByIdAndDelete(delItem._id);
        removedByTitleCount++;
      }
    }
  }

  const finalCount = await Resource.countDocuments();
  console.log('\n=== DUPLICATE CHECK SUMMARY ===');
  if (autoRemove) {
    console.log(`✅ Removed Duplicate fileUrls: ${removedByUrlCount}`);
    console.log(`✅ Removed Duplicate Titles: ${removedByTitleCount}`);
    console.log(`📚 Cleaned Total Resources in DB: ${finalCount}`);
  } else {
    console.log(`⚠️ Total Duplicate Groups Found: ${duplicateFileUrls.length + duplicateTitles.length}`);
    console.log(`💡 Run with autoRemove=true to automatically deduplicate DB records.`);
  }

  process.exit(0);
}

// Pass process.argv[2] === '--clean' to execute auto-removal
const shouldClean = process.argv.includes('--clean');
checkAndCleanDuplicates(shouldClean).catch(console.error);
