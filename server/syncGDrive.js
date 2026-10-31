const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT_FOLDER_ID = process.env.GDRIVE_ROOT_FOLDER_ID || '17wu7GVSWBKR0XR9HgVNjmRJiUTBBHOde';

function fetchFolder(folderId) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/drive/folders/${folderId}`;
    https.get(url, (res) => {
      let html = '';
      res.on('data', (chunk) => (html += chunk));
      res.on('end', () => {
        const regex = /data-id="([a-zA-Z0-9_-]{25,})"[^>]*?>.*?<strong class="DNoYtb">([^<]+)<\/strong>/g;
        let match;
        const items = [];
        while ((match = regex.exec(html)) !== null) {
          items.push({ id: match[1], name: match[2].replace(/&amp;/g, '&') });
        }
        resolve(items);
      });
    }).on('error', () => resolve([]));
  });
}

const fileMap = {};
let fileCount = 0;
let folderCount = 0;

async function crawl(folderId, currentPath = '') {
  const items = await fetchFolder(folderId);
  for (const item of items) {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    if (item.name.toLowerCase().endsWith('.pdf')) {
      fileMap[item.name.toLowerCase()] = item.id;
      fileMap[itemPath.toLowerCase()] = item.id;
      fileCount++;
      console.log(`[PDF] ${itemPath} -> ${item.id}`);
    } else {
      folderCount++;
      await crawl(item.id, itemPath);
    }
  }
}

async function syncGDrive() {
  console.log('=== STARTING GOOGLE DRIVE CRAWL & INDEX ===');
  console.log(`Root Folder ID: ${ROOT_FOLDER_ID}`);
  await crawl(ROOT_FOLDER_ID);
  console.log(`\nCrawl complete: ${fileCount} PDF files, ${folderCount} folders found.`);

  const outputPath = path.join(__dirname, 'config/gdriveFiles.json');
  fs.writeFileSync(outputPath, JSON.stringify(fileMap, null, 2));
  console.log(`Saved mapping to ${outputPath}\n`);
}

module.exports = { syncGDrive };

if (require.main === module) {
  syncGDrive()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error syncing Google Drive:', err);
      process.exit(1);
    });
}
