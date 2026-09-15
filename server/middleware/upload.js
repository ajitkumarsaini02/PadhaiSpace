const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '../protected_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generate safe, un-guessable server filename; never use original filename in filesystem path
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeFilename = `resource_${Date.now()}_${randomHex}.pdf`;
    cb(null, safeFilename);
  },
});

function checkPDFType(file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMime = [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'application/vnd.pdf',
    'text/pdf',
  ];

  if (ext === '.pdf' && allowedMime.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('INVALID_FILE_TYPE: Only valid PDF (.pdf) documents are permitted.'));
}

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB maximum file size limit
    files: 1, // Only 1 file per upload request
  },
  fileFilter(req, file, cb) {
    checkPDFType(file, cb);
  },
});

module.exports = upload;
