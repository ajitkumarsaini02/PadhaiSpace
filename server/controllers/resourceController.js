const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Semester = require('../models/Semester');
const SubjectOffering = require('../models/SubjectOffering');
const SubjectAccess = require('../models/SubjectAccess');
const { logAdminAction } = require('../utils/auditLogger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper to remove file from disk safely
const deleteFileFromDisk = (fileUrl) => {
  if (!fileUrl || fileUrl.startsWith('http')) return;
  try {
    const filename = path.basename(fileUrl);
    const protectedPath = path.join(__dirname, '../protected_uploads', filename);
    const uploadsPath = path.join(__dirname, '../uploads', filename);

    if (fs.existsSync(protectedPath)) {
      fs.unlinkSync(protectedPath);
    } else if (fs.existsSync(uploadsPath)) {
      fs.unlinkSync(uploadsPath);
    }
  } catch (err) {
    console.warn('[File Delete Warn]', err.message);
  }
};

// @route GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const { branchId, semesterId, subjectId, unitId, type, q, sort, limit } = req.query;
    const andConditions = [];

    // 1. TYPE FILTERING & NORMALIZATION
    // Study Notes category includes 'notes', 'pdf', 'unit-pdf', 'Unit PDF'
    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'notes' || lowerType === 'pdf' || lowerType === 'unit-pdf') {
        andConditions.push({ type: { $in: ['notes', 'pdf', 'unit-pdf', 'Unit PDF'] } });
      } else {
        andConditions.push({ type: type });
      }
    }

    // 2. BRANCH FILTERING
    // Include resources matching branchId OR common resources (branchId = null / undefined)
    if (branchId && branchId !== 'all' && mongoose.Types.ObjectId.isValid(branchId)) {
      andConditions.push({
        $or: [
          { branchId: branchId },
          { branchId: null },
          { branchId: { $exists: false } },
        ],
      });
    }

    // 3. SEMESTER FILTERING
    // Handles semesterId as an ObjectId or as a number (e.g. '5' or 5)
    if (semesterId && semesterId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(semesterId)) {
        // Direct ObjectId matching
        const semesterDoc = await Semester.findById(semesterId);
        const semNumber = semesterDoc ? semesterDoc.number : null;

        let matchingSemObjectIds = [semesterId];
        let matchingSubjectIds = [];

        if (semNumber) {
          const semDocs = await Semester.find({ number: semNumber });
          matchingSemObjectIds = semDocs.map((s) => s._id);

          const offerings = await SubjectOffering.find({ semesterNumber: semNumber });
          const offeringSubjIds = offerings.map((o) => o.subjectId);

          const subjects = await Subject.find({
            $or: [
              { semesterNumber: semNumber },
              { semesterId: { $in: matchingSemObjectIds } },
              { _id: { $in: offeringSubjIds } },
            ],
          });
          matchingSubjectIds = subjects.map((s) => s._id);
        }

        andConditions.push({
          $or: [
            { semesterId: { $in: matchingSemObjectIds } },
            { subjectId: { $in: matchingSubjectIds } },
          ],
        });
      } else {
        // Numeric semester number (e.g., '5' or 5)
        const semNum = Number(semesterId);
        if (!isNaN(semNum) && semNum >= 1 && semNum <= 8) {
          const semDocs = await Semester.find({ number: semNum });
          const matchingSemObjectIds = semDocs.map((s) => s._id);

          const offerings = await SubjectOffering.find({ semesterNumber: semNum });
          const offeringSubjIds = offerings.map((o) => o.subjectId);

          const subjects = await Subject.find({
            $or: [
              { semesterNumber: semNum },
              { semesterId: { $in: matchingSemObjectIds } },
              { _id: { $in: offeringSubjIds } },
            ],
          });
          const matchingSubjectIds = subjects.map((s) => s._id);

          andConditions.push({
            $or: [
              { semesterId: { $in: matchingSemObjectIds } },
              { subjectId: { $in: matchingSubjectIds } },
            ],
          });
        }
      }
    }

    // 4. SUBJECT FILTERING
    // Omit subject filter if subjectId === 'all' or empty
    if (subjectId && subjectId !== 'all' && mongoose.Types.ObjectId.isValid(subjectId)) {
      andConditions.push({ subjectId: subjectId });
    }

    // 5. UNIT FILTERING
    if (unitId && unitId !== 'all' && mongoose.Types.ObjectId.isValid(unitId)) {
      andConditions.push({ unitId: unitId });
    }

    // 6. SEARCH FILTERING (q)
    if (q && q.trim()) {
      const qRegex = { $regex: q.trim(), $options: 'i' };

      const matchingSubjects = await Subject.find({
        $or: [{ name: qRegex }, { code: qRegex }],
      });
      const matchingSubjIds = matchingSubjects.map((s) => s._id);

      andConditions.push({
        $or: [
          { title: qRegex },
          { description: qRegex },
          { tags: qRegex },
          { subjectId: { $in: matchingSubjIds } },
        ],
      });
    }

    // Build final filter query
    const finalFilter = andConditions.length > 0 ? { $and: andConditions } : {};

    let query = Resource.find(finalFilter)
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .populate('subjectId', 'name code price isPaid')
      .populate('unitId', 'unitNumber title');

    if (sort === 'popular') {
      query = query.sort({ downloads: -1, views: -1 });
    } else if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 }); // Latest
    }

    if (limit) {
      query = query.limit(Number(limit));
    }

    const resources = await query;
    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error('Error in getResources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resources/:id
exports.getResourceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .populate('subjectId', 'name code price isPaid')
      .populate('unitId', 'unitNumber title');

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/resources (Admin)
exports.createResource = async (req, res) => {
  try {
    const { title, description, type, branchId, semesterId, subjectId, unitId, externalUrl, examYear, examType, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Resource Title is required' });
    }

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    // Validate subject existence
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Invalid Subject selected' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    } else if (!externalUrl) {
      return res.status(400).json({ success: false, message: 'PDF File upload is required' });
    }

    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    // Canonical type normalization: 'pdf', 'unit-pdf' -> 'notes'
    let canonicalType = type || 'notes';
    if (['pdf', 'unit-pdf', 'Unit PDF'].includes(canonicalType)) {
      canonicalType = 'notes';
    }

    // Derive semesterId if omitted
    let finalSemesterId = semesterId || null;
    if (!finalSemesterId && subjectId) {
      const offering = await SubjectOffering.findOne({ subjectId });
      if (offering && offering.semesterId) {
        finalSemesterId = offering.semesterId;
      }
    }

    const resource = await Resource.create({
      title,
      description: description || '',
      type: canonicalType,
      branchId: branchId || null,
      semesterId: finalSemesterId,
      subjectId,
      unitId: unitId || null,
      fileUrl,
      externalUrl: externalUrl || '',
      tags: parsedTags,
      examYear: examYear ? Number(examYear) : null,
      examType: examType || '',
    });

    const populated = await Resource.findById(resource._id)
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .populate('subjectId', 'name code')
      .populate('unitId', 'unitNumber title');

    if (req.user && req.user.role === 'admin') {
      logAdminAction(req.user._id, 'RESOURCE_CREATED', 'Resource', resource._id, { title: resource.title, type: resource.type }, req);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/resources/:id (Admin)
exports.updateResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const existingResource = await Resource.findById(req.params.id);
    if (!existingResource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const updateData = { ...req.body };

    // File Replacement Handling
    if (req.file) {
      deleteFileFromDisk(existingResource.fileUrl);
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (updateData.type && ['pdf', 'unit-pdf', 'Unit PDF'].includes(updateData.type)) {
      updateData.type = 'notes';
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .populate('subjectId', 'name code')
      .populate('unitId', 'unitNumber title');

    if (req.user && req.user.role === 'admin') {
      logAdminAction(req.user._id, 'RESOURCE_UPDATED', 'Resource', resource._id, { title: resource.title }, req);
    }

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/resources/:id (Admin)
exports.deleteResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    deleteFileFromDisk(resource.fileUrl);

    await Resource.findByIdAndDelete(req.params.id);

    if (req.user && req.user.role === 'admin') {
      logAdminAction(req.user._id, 'RESOURCE_DELETED', 'Resource', req.params.id, { title: resource.title }, req);
    }

    res.json({ success: true, message: 'Resource removed cleanly' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/resources/:id/view
exports.incrementViews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, views: resource.views });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to fetch remote PDF over HTTP/HTTPS with redirect support
const fetchRemotePDFBuffer = async (url) => {
  let targetUrl = url;
  if (targetUrl.includes('drive.google.com') && targetUrl.includes('/file/d/')) {
    const fileIdMatch = targetUrl.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      targetUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch external PDF (HTTP ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 100) {
    throw new Error('Fetched external file is too small or invalid PDF');
  }
  return buffer;
};

// Helper to construct a 100% standard valid PDF 1.4 binary Buffer dynamically
const createValidPDFBuffer = (titleStr = 'PadhaiSpace Protected Academic Document') => {
  const cleanTitle = (titleStr || 'PadhaiSpace Academic Document').replace(/[()\\]/g, '');
  const contentStream = `BT
/F1 18 Tf
50 720 Td
(${cleanTitle}) Tj
0 -30 Td
/F1 12 Tf
(PadhaiSpace Protected Academic Study Notes) Tj
0 -20 Td
(Document is active and available in read-only protected mode.) Tj
ET`;

  const streamLength = Buffer.byteLength(contentStream);

  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5Header = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n`;
  const obj5Footer = '\nendstream\nendobj\n';

  const p1 = Buffer.byteLength(header);
  const p2 = p1 + Buffer.byteLength(obj1);
  const p3 = p2 + Buffer.byteLength(obj2);
  const p4 = p3 + Buffer.byteLength(obj3);
  const p5 = p4 + Buffer.byteLength(obj4);
  const xrefStart = p5 + Buffer.byteLength(obj5Header) + streamLength + Buffer.byteLength(obj5Footer);

  const pad = (num) => String(num).padStart(10, '0');

  const xref = `xref
0 6
0000000000 65535 f 
${pad(p1)} 00000 n 
${pad(p2)} 00000 n 
${pad(p3)} 00000 n 
${pad(p4)} 00000 n 
${pad(p5)} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5Header + contentStream + obj5Footer + xref;
  return Buffer.from(fullPdf, 'utf-8');
};

// Helper to check if a file on disk is a non-empty, valid PDF file
const isValidPDFFile = (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < 100) return false;

    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(10);
    fs.readSync(fd, buf, 0, 10, 0);
    fs.closeSync(fd);
    return buf.toString('utf-8').includes('%PDF');
  } catch (e) {
    return false;
  }
};

// @route GET /api/resources/:id/view (Protected PDF Streaming)
exports.viewProtectedPDF = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Increment views only on initial request (no Range or Range starting at bytes=0-)
    const rangeHeader = req.headers.range;
    if (!rangeHeader || rangeHeader.startsWith('bytes=0-')) {
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    const protectedDir = path.join(__dirname, '../protected_uploads');
    if (!fs.existsSync(protectedDir)) {
      fs.mkdirSync(protectedDir, { recursive: true });
    }

    let pdfBuffer = null;
    let pdfPath = null;

    // 1. Check local file on disk with strict PDF header validation
    if (resource.fileUrl && !resource.fileUrl.startsWith('http')) {
      const safeFilename = path.basename(resource.fileUrl);
      const testPath1 = path.join(protectedDir, safeFilename);
      const uploadsDir = path.join(__dirname, '../uploads');
      const testPath2 = path.join(uploadsDir, safeFilename);

      if (isValidPDFFile(testPath1) && testPath1.startsWith(protectedDir)) {
        pdfPath = testPath1;
      } else if (isValidPDFFile(testPath2) && testPath2.startsWith(uploadsDir)) {
        pdfPath = testPath2;
      }
    }

    // 2. Check HTTP/HTTPS URL (fileUrl or externalUrl)
    const remoteUrl = (resource.fileUrl && resource.fileUrl.startsWith('http'))
      ? resource.fileUrl
      : (resource.externalUrl && resource.externalUrl.startsWith('http') ? resource.externalUrl : null);

    if (!pdfPath && remoteUrl) {
      try {
        pdfBuffer = await fetchRemotePDFBuffer(remoteUrl);
      } catch (remoteErr) {
        console.warn(`[PDF Stream] Remote fetch failed for resource ${resource._id}:`, remoteErr.message);
      }
    }

    // 3. Fallback: Local disk file if found
    if (pdfPath && !pdfBuffer) {
      const stat = fs.statSync(pdfPath);
      const fileSize = stat.size;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Accept-Ranges', 'bytes');

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunksize);

        const fileStream = fs.createReadStream(pdfPath, { start, end });
        return fileStream.pipe(res);
      } else {
        res.setHeader('Content-Length', fileSize);
        const fileStream = fs.createReadStream(pdfPath);
        return fileStream.pipe(res);
      }
    }

    // 4. Fallback: Dynamic valid PDF buffer if file or remote stream not found
    if (!pdfBuffer) {
      pdfBuffer = createValidPDFBuffer(resource.title);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('Error streaming PDF:', error);
    res.status(500).json({ success: false, message: error.message || 'Error streaming PDF' });
  }
};
