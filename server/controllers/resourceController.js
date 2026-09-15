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

    // ENTITLEMENT CHECK FOR PAID SUBJECTS
    // 1. Admin users bypass purchase check (Admin Override)
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && resource.subjectId) {
      const subject = await Subject.findById(resource.subjectId);
      if (subject && subject.isPaid !== false) {
        const access = await SubjectAccess.findOne({
          userId: req.user._id,
          subjectId: subject._id,
          status: 'active',
        });

        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'Purchase this subject to access the PDF.',
            isPaidSubject: true,
            subjectId: subject._id,
            price: subject.price || 9,
          });
        }
      }
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

    let pdfPath;
    if (resource.fileUrl && !resource.fileUrl.startsWith('http')) {
      // Path traversal protection: resolve basename strictly
      const safeFilename = path.basename(resource.fileUrl);
      const testPath1 = path.join(protectedDir, safeFilename);
      const uploadsDir = path.join(__dirname, '../uploads');
      const testPath2 = path.join(uploadsDir, safeFilename);

      if (fs.existsSync(testPath1) && testPath1.startsWith(protectedDir)) {
        pdfPath = testPath1;
      } else if (fs.existsSync(testPath2) && testPath2.startsWith(uploadsDir)) {
        pdfPath = testPath2;
      }
    }

    // Fallback sample PDF if file is not found on disk
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      pdfPath = path.join(protectedDir, 'sample_resource.pdf');
      const validPDFContent = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R 5 0 R] /Count 2>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>>>> /Contents 4 0 R>>
endobj
4 0 obj
<</Length 72>>
stream
BT
/F1 20 Tf
50 720 Td
(PadhaiSpace Protected Academic Document - Page 1) Tj
ET
endstream
endobj
5 0 obj
<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>>>> /Contents 6 0 R>>
endobj
6 0 obj
<</Length 72>>
stream
BT
/F1 20 Tf
50 720 Td
(PadhaiSpace Protected Academic Document - Page 2) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000109 00000 n 
0000000282 00000 n 
0000000403 00000 n 
0000000576 00000 n 
trailer
<</Size 7 /Root 1 0 R>>
startxref
697
%%EOF`;
      fs.writeFileSync(pdfPath, Buffer.from(validPDFContent));
    }

    const stat = fs.statSync(pdfPath);
    const fileSize = stat.size;

    // Strict Security & Cache Control Headers
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
      fileStream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Error streaming PDF:', error);
    res.status(500).json({ success: false, message: error.message || 'Error streaming PDF' });
  }
};
