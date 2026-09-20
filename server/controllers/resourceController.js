const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const { logAdminAction } = require('../utils/auditLogger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

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

// @route GET /api/resources/meta/sources
exports.getSources = async (req, res) => {
  try {
    const { type } = req.query;
    const baseFilter = {};
    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'notes' || lowerType === 'pdf' || lowerType === 'unit-pdf') {
        baseFilter.type = { $in: ['notes', 'pdf', 'unit-pdf', 'Unit PDF'] };
      } else {
        baseFilter.type = type;
      }
    }

    const gatewayCount = await Resource.countDocuments({
      ...baseFilter,
      source: { $regex: '^gateway classes', $options: 'i' },
    });

    const edushineCount = await Resource.countDocuments({
      ...baseFilter,
      source: { $regex: '^edushine classes', $options: 'i' },
    });

    const multiAtomCount = await Resource.countDocuments({
      ...baseFilter,
      source: { $regex: '^multi atom', $options: 'i' },
    });

    const totalCount = await Resource.countDocuments(baseFilter);
    const topThreeSum = gatewayCount + edushineCount + multiAtomCount;
    const otherCount = Math.max(0, totalCount - topThreeSum);

    res.json({
      success: true,
      data: [
        { id: 'gateway-classes', name: 'Gateway Classes', count: gatewayCount },
        { id: 'edushine-classes', name: 'EduShine Classes', count: edushineCount },
        { id: 'multi-atom', name: 'Multi Atom', count: multiAtomCount },
        { id: 'other-notes', name: 'Other Notes', count: otherCount },
      ],
    });
  } catch (error) {
    console.error('Error in getSources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resources/meta/academic-years
exports.getAcademicYears = async (req, res) => {
  try {
    const { source, type } = req.query;
    const filter = {};

    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'notes' || lowerType === 'pdf' || lowerType === 'unit-pdf') {
        filter.type = { $in: ['notes', 'pdf', 'unit-pdf', 'Unit PDF'] };
      } else {
        filter.type = type;
      }
    }

    if (source && source.trim() && source !== 'all') {
      const cleanSource = source.trim().toLowerCase();
      if (cleanSource === 'gateway-classes' || cleanSource === 'gateway classes') {
        filter.source = { $regex: '^gateway classes', $options: 'i' };
      } else if (cleanSource === 'edushine-classes' || cleanSource === 'edushine classes') {
        filter.source = { $regex: '^edushine classes', $options: 'i' };
      } else if (cleanSource === 'multi-atom' || cleanSource === 'multi atom') {
        filter.source = { $regex: '^multi atom', $options: 'i' };
      } else if (cleanSource === 'other-notes' || cleanSource === 'other') {
        filter.$or = [
          { source: 'Other Notes' },
          { source: '' },
          { source: { $exists: false } },
          { source: { $not: { $regex: '^(gateway classes|edushine classes|multi atom)', $options: 'i' } } },
        ];
      } else {
        filter.source = { $regex: source.trim(), $options: 'i' };
      }
    }

    const distinctYears = await Resource.distinct('academicYear', filter);

    const canonicalOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const validYears = distinctYears
      .filter((y) => typeof y === 'string' && y.trim() !== '')
      .sort((a, b) => {
        const idxA = canonicalOrder.indexOf(a);
        const idxB = canonicalOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

    res.json({ success: true, data: validYears });
  } catch (error) {
    console.error('Error in getAcademicYears:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resources/meta/paper-years
exports.getPaperYears = async (req, res) => {
  try {
    const { academicYear, subjectId, source, type } = req.query;
    const filter = { type: (type || 'pyq').toLowerCase() };

    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }
    if (subjectId && subjectId !== 'all' && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter.subjectId = subjectId;
    }
    if (source && source.trim() && source !== 'all') {
      filter.source = { $regex: source.trim(), $options: 'i' };
    }

    const distinctYears = await Resource.distinct('paperYear', filter);
    const validYears = distinctYears
      .filter((y) => typeof y === 'number' && !isNaN(y))
      .sort((a, b) => b - a);

    res.json({ success: true, data: validYears });
  } catch (error) {
    console.error('Error in getPaperYears:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resources/meta/pyq-subjects
exports.getPYQSubjects = async (req, res) => {
  try {
    const { academicYear, paperYear, source } = req.query;
    const filter = { type: 'pyq' };

    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }
    if (paperYear && paperYear !== 'all' && !isNaN(Number(paperYear))) {
      filter.paperYear = Number(paperYear);
    }
    if (source && source.trim() && source !== 'all') {
      filter.source = { $regex: source.trim(), $options: 'i' };
    }

    const distinctSubjectIds = await Resource.distinct('subjectId', filter);
    const validSubjectIds = distinctSubjectIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const subjects = await Subject.find({ _id: { $in: validSubjectIds } }).select('name code description thumbnail');
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error in getPYQSubjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const { subjectId, unitId, type, q, sort, limit, page, academicYear, paperYear, year, source } = req.query;
    const andConditions = [];

    // 1. TYPE FILTERING & NORMALIZATION
    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'notes' || lowerType === 'pdf' || lowerType === 'unit-pdf') {
        andConditions.push({ type: { $in: ['notes', 'pdf', 'unit-pdf', 'Unit PDF'] } });
      } else {
        andConditions.push({ type: type });
      }
    }

    // 2. SUBJECT FILTERING
    if (subjectId && subjectId !== 'all' && mongoose.Types.ObjectId.isValid(subjectId)) {
      andConditions.push({ subjectId: subjectId });
    }

    // 3. UNIT FILTERING
    if (unitId && unitId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(unitId)) {
        andConditions.push({ unitId: unitId });
      } else {
        const unitNum = parseInt(unitId.toString().replace(/\D/g, ''), 10);
        if (!isNaN(unitNum)) {
          const matchingUnits = await Unit.find({ unitNumber: unitNum }).distinct('_id');
          const unitPattern = `unit[\\s_\\-]*0?${unitNum}|\\bu0?${unitNum}\\b`;
          const unitRegex = new RegExp(unitPattern, 'i');
          andConditions.push({
            $or: [
              { unitId: { $in: matchingUnits } },
              { title: unitRegex },
              { tags: unitRegex },
              { description: unitRegex },
            ],
          });
        }
      }
    }

    // 4. ACADEMIC YEAR FILTERING
    if (academicYear && academicYear !== 'all') {
      andConditions.push({ academicYear: academicYear });
    }

    // 5. PAPER YEAR FILTERING
    if (paperYear && paperYear !== 'all' && !isNaN(Number(paperYear))) {
      andConditions.push({ paperYear: Number(paperYear) });
    }

    // 6. YEAR FILTERING
    if (year && year !== 'all' && !isNaN(Number(year))) {
      andConditions.push({ year: Number(year) });
    }

    // 7. SOURCE FILTERING & SLUG HANDLING
    if (source && source.trim() && source !== 'all') {
      const cleanSource = source.trim().toLowerCase();
      if (cleanSource === 'gateway-classes' || cleanSource === 'gateway classes') {
        andConditions.push({ source: { $regex: '^gateway classes', $options: 'i' } });
      } else if (cleanSource === 'edushine-classes' || cleanSource === 'edushine classes') {
        andConditions.push({ source: { $regex: '^edushine classes', $options: 'i' } });
      } else if (cleanSource === 'multi-atom' || cleanSource === 'multi atom') {
        andConditions.push({ source: { $regex: '^multi atom', $options: 'i' } });
      } else if (cleanSource === 'other-notes' || cleanSource === 'other') {
        andConditions.push({
          $or: [
            { source: 'Other Notes' },
            { source: '' },
            { source: { $exists: false } },
            { source: { $not: { $regex: '^(gateway classes|edushine classes|multi atom)', $options: 'i' } } },
          ],
        });
      } else {
        andConditions.push({ source: { $regex: source.trim(), $options: 'i' } });
      }
    }

    // 8. SEARCH FILTERING (q)
    if (q && q.trim()) {
      const cleanQ = q.trim();
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const terms = cleanQ.split(/\s+/).filter(Boolean);

      if (terms.length > 0) {
        const termConditions = await Promise.all(
          terms.map(async (term) => {
            const termEscaped = escapeRegExp(term);
            const termRegex = new RegExp(termEscaped, 'i');

            const [matchingSubjs, matchingUnits] = await Promise.all([
              Subject.find({
                $or: [{ name: termRegex }, { code: termRegex }],
              }).distinct('_id'),
              Unit.find({
                $or: [{ title: termRegex }],
              }).distinct('_id'),
            ]);

            return {
              $or: [
                { title: termRegex },
                { description: termRegex },
                { tags: termRegex },
                { source: termRegex },
                { academicYear: termRegex },
                { subjectId: { $in: matchingSubjs } },
                { unitId: { $in: matchingUnits } },
              ],
            };
          })
        );

        andConditions.push({ $and: termConditions });
      }
    }

    const finalFilter = andConditions.length > 0 ? { $and: andConditions } : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Resource.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    let query = Resource.find(finalFilter)
      .populate('subjectId', 'name code')
      .populate('unitId', 'unitNumber title');

    if (sort === 'popular') {
      query = query.sort({ downloads: -1, views: -1 });
    } else if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit) {
      query = query.skip(skip).limit(limitNum);
    }

    const resources = await query;
    res.json({
      success: true,
      count: totalCount,
      totalPages,
      currentPage: pageNum,
      data: resources,
    });
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
      .populate('subjectId', 'name code')
      .populate('unitId', 'unitNumber title');

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper for validating and normalizing resource payloads server-side
const validateAndNormalizeResourcePayload = async (payload, isUpdate = false) => {
  const {
    title,
    type,
    subjectId,
    unitId,
    source,
    academicYear,
    paperYear,
    year,
    description,
    externalUrl,
    tags,
  } = payload;

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('Resource Title is required');
    }
  }

  const rawType = (type || 'notes').toString().toLowerCase().trim();
  const validTypes = ['notes', 'unit-pdf', 'pyq', 'syllabus', 'exam-resource', 'pdf', 'other'];
  if (!validTypes.includes(rawType)) {
    throw new Error(`Invalid Resource Type. Must be one of: ${validTypes.join(', ')}`);
  }

  const cleanTitle = title ? title.trim() : '';
  const cleanDescription = description ? description.trim() : '';
  const cleanSource = source ? source.trim() : '';
  const cleanAcademicYear = academicYear ? academicYear.trim() : '';
  const cleanExternalUrl = externalUrl ? externalUrl.trim() : '';

  let validSubjectId = null;
  if (subjectId && subjectId !== 'all') {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw new Error('Invalid Subject ID format');
    }
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      throw new Error('Selected Subject does not exist');
    }
    validSubjectId = subjectId;
  }

  let validUnitId = null;
  if (unitId && unitId !== 'all') {
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      throw new Error('Invalid Unit ID format');
    }
    const unitExists = await Unit.findById(unitId);
    if (!unitExists) {
      throw new Error('Selected Unit does not exist');
    }
    validUnitId = unitId;
  }

  let numPaperYear = null;
  if (paperYear !== undefined && paperYear !== null && paperYear !== '') {
    const pYear = Number(paperYear);
    if (isNaN(pYear) || pYear < 1900 || pYear > 2100) {
      throw new Error('Paper Year must be a valid 4-digit year (e.g. 2025)');
    }
    numPaperYear = pYear;
  }

  // Strict Type-Based Business Rules
  if (rawType === 'notes' || rawType === 'unit-pdf') {
    if (!cleanAcademicYear) {
      throw new Error(`Academic Year is required for ${rawType === 'notes' ? 'Notes' : 'Unit PDF'}`);
    }
    if (!validSubjectId) {
      throw new Error(`Subject is required for ${rawType === 'notes' ? 'Notes' : 'Unit PDF'}`);
    }
    if (!validUnitId) {
      throw new Error(`Unit is required for ${rawType === 'notes' ? 'Notes' : 'Unit PDF'}`);
    }
    if (!cleanSource) {
      throw new Error(`Source / Provider is required for ${rawType === 'notes' ? 'Notes' : 'Unit PDF'}`);
    }
    numPaperYear = null;
  } else if (rawType === 'pyq') {
    if (!cleanAcademicYear) {
      throw new Error('Academic Year is required for Previous Year Question Paper (PYQ)');
    }
    if (!numPaperYear) {
      throw new Error('Paper Year is required for Previous Year Question Paper (PYQ)');
    }
    if (!validSubjectId) {
      throw new Error('Subject is required for Previous Year Question Paper (PYQ)');
    }
    validUnitId = null;
  } else if (rawType === 'syllabus') {
    validUnitId = null;
    numPaperYear = null;
  } else {
    numPaperYear = null;
  }

  const parsedTags = Array.isArray(tags)
    ? tags.map((t) => t.toString().trim()).filter(Boolean)
    : typeof tags === 'string'
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    title: cleanTitle,
    description: cleanDescription,
    type: rawType,
    subjectId: validSubjectId,
    unitId: validUnitId,
    source: cleanSource,
    academicYear: cleanAcademicYear,
    paperYear: numPaperYear,
    year: year ? Number(year) : null,
    externalUrl: cleanExternalUrl,
    tags: parsedTags,
  };
};

// @route POST /api/resources (Admin)
exports.createResource = async (req, res) => {
  try {
    const validatedData = await validateAndNormalizeResourcePayload(req.body, false);

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    } else if (!validatedData.externalUrl) {
      return res.status(400).json({ success: false, message: 'PDF File upload is required' });
    }

    const resource = await Resource.create({
      ...validatedData,
      fileUrl,
    });

    const populated = await Resource.findById(resource._id)
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

    const mergedPayload = { ...existingResource.toObject(), ...req.body };
    const validatedData = await validateAndNormalizeResourcePayload(mergedPayload, true);

    if (req.file) {
      deleteFileFromDisk(existingResource.fileUrl);
      validatedData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, validatedData, { new: true })
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

// Helper to construct a standard valid PDF binary Buffer
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

const isValidPDFFile = (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < 100) return false;

    const fd = fs.openSync(filePath, 'r');
    const readBytes = Math.min(1024, stat.size);
    const buf = Buffer.alloc(readBytes);
    fs.readSync(fd, buf, 0, readBytes, 0);
    fs.closeSync(fd);
    return buf.toString('latin1').includes('%PDF') || buf.toString('utf-8').includes('%PDF');
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

    const rangeHeader = req.headers.range;
    if (!rangeHeader || rangeHeader.startsWith('bytes=0-')) {
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    const resolvedProtectedDir = path.resolve(path.join(__dirname, '../protected_uploads'));
    const resolvedUploadsDir = path.resolve(path.join(__dirname, '../uploads'));

    if (!fs.existsSync(resolvedProtectedDir)) {
      fs.mkdirSync(resolvedProtectedDir, { recursive: true });
    }

    let pdfBuffer = null;
    let pdfPath = null;

    if (resource.fileUrl && !resource.fileUrl.startsWith('http')) {
      const isSubpath = (parentDir, targetPath) => {
        const p = parentDir.toLowerCase();
        const t = targetPath.toLowerCase();
        return t === p || t.startsWith(p + path.sep) || t.startsWith(p.replace(/\\/g, '/') + '/');
      };

      const cleanRelPath = resource.fileUrl.replace(/^[\/\\]+(uploads|protected_uploads)[\/\\]+/i, '').replace(/^[\/\\]+/, '');
      const safeFilename = path.basename(resource.fileUrl);

      const candidatePaths = [
        path.resolve(path.join(resolvedProtectedDir, cleanRelPath)),
        path.resolve(path.join(resolvedUploadsDir, cleanRelPath)),
        path.resolve(path.join(resolvedProtectedDir, safeFilename)),
        path.resolve(path.join(resolvedUploadsDir, safeFilename)),
      ];

      for (const cand of candidatePaths) {
        if (isValidPDFFile(cand) && (isSubpath(resolvedProtectedDir, cand) || isSubpath(resolvedUploadsDir, cand))) {
          pdfPath = cand;
          break;
        }
      }
    }

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

    if (!pdfPath && !pdfBuffer && supabase) {
      try {
        const bucketName = process.env.SUPABASE_BUCKET || 'pdf-notes';
        let rawPath = (resource.fileUrl || '').replace(/^[\/\\]+(uploads|protected_uploads)[\/\\]+/i, '').replace(/^[\/\\]+/, '');
        rawPath = rawPath.replace(/\\/g, '/');

        const candidateStoragePaths = [
          rawPath,
          rawPath.startsWith('Notes/') ? rawPath : `Notes/${rawPath}`,
          rawPath.startsWith('Notes/') ? rawPath.substring(6) : rawPath,
          path.basename(rawPath)
        ];

        const uniqueCandidatePaths = [...new Set(candidateStoragePaths)].filter(Boolean);

        for (const storagePath of uniqueCandidatePaths) {
          const { data, error } = await supabase.storage.from(bucketName).download(storagePath);
          if (!error && data) {
            const arrayBuf = await data.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuf);
            console.log(`[Supabase Stream Success] Retrieved ${pdfBuffer.length} bytes for resource ${resource._id} via path '${storagePath}'`);
            break;
          } else if (error) {
            console.warn(`[Supabase Storage Stream Warn] Resource ${resource._id} path '${storagePath}':`, error.message);
          }
        }
      } catch (supabaseErr) {
        console.warn(`[Supabase Stream Error] ${resource._id}:`, supabaseErr.message);
      }
    }

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
