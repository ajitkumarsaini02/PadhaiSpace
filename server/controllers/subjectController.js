const Subject = require('../models/Subject');
const SubjectOffering = require('../models/SubjectOffering');
const Resource = require('../models/Resource');
const Semester = require('../models/Semester');

// Helper to normalize subject names for matching
const normalizeSubjectName = (str) => {
  return str ? str.trim().toLowerCase().replace(/\s+/g, ' ') : '';
};

// @route GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const queryBranchId = req.query.branchId || req.params.branchId;
    const querySemId = req.query.semesterId || req.params.semesterId;
    let querySemNum = req.query.semesterNumber;

    if (!querySemNum && querySemId && !isNaN(querySemId)) {
      querySemNum = Number(querySemId);
    }

    const { subjectType, type, q } = req.query;
    let offeringFilter = {};

    if (queryBranchId) offeringFilter.branchId = queryBranchId;
    if (querySemNum) {
      offeringFilter.semesterNumber = Number(querySemNum);
    } else if (querySemId && querySemId.match(/^[0-9a-fA-F]{24}$/)) {
      offeringFilter.semesterId = querySemId;
    }

    // Find offering subjectIds matching branch/semester filters
    let targetSubjectIds = null;
    if (queryBranchId || querySemId || querySemNum) {
      const offerings = await SubjectOffering.find(offeringFilter).select('subjectId');
      targetSubjectIds = offerings.map((o) => o.subjectId.toString());
    }

    let subjectFilter = {};
    if (targetSubjectIds !== null) {
      subjectFilter._id = { $in: targetSubjectIds };
    }

    const typeValue = (subjectType || type || '').toLowerCase();
    if (typeValue && ['theory', 'lab', 'elective', 'other'].includes(typeValue)) {
      subjectFilter.subjectType = typeValue;
    }

    if (q) {
      subjectFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const canonicalSubjects = await Subject.find(subjectFilter)
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .sort({ subjectType: 1, name: 1 });

    const subjectIds = canonicalSubjects.map((s) => s._id);

    // Fetch all offerings for these subjects to enrich canonical subject objects
    const allOfferings = await SubjectOffering.find({ subjectId: { $in: subjectIds } })
      .populate('branchId', 'name code description')
      .populate('semesterId', 'number');

    const offeringsBySubject = {};
    allOfferings.forEach((off) => {
      const sId = off.subjectId.toString();
      if (!offeringsBySubject[sId]) offeringsBySubject[sId] = [];
      offeringsBySubject[sId].push(off);
    });

    // Resource count per canonical subject
    const counts = await Resource.aggregate([
      { $match: { subjectId: { $in: subjectIds } } },
      { $group: { _id: '$subjectId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const subjectsWithOfferings = canonicalSubjects.map((s) => {
      const plainObj = s.toObject();
      const offs = offeringsBySubject[s._id.toString()] || [];
      plainObj.offerings = offs;
      plainObj.resourceCount = countMap[s._id.toString()] || 0;

      // Extract unique branches and semester numbers from offerings
      const branchMap = {};
      const semMap = {};
      offs.forEach((o) => {
        if (o.branchId) branchMap[o.branchId._id ? o.branchId._id.toString() : o.branchId] = o.branchId;
        if (o.semesterNumber) semMap[o.semesterNumber] = true;
      });

      plainObj.branches = Object.values(branchMap);
      plainObj.semesterNumbers = Object.keys(semMap).map(Number).sort();
      
      // Fallbacks if offerings list is empty
      if (plainObj.branches.length === 0 && plainObj.branchId) {
        plainObj.branches = [plainObj.branchId];
      }
      if (plainObj.semesterNumbers.length === 0 && plainObj.semesterNumber) {
        plainObj.semesterNumbers = [plainObj.semesterNumber];
      }

      return plainObj;
    });

    res.json({ success: true, count: subjectsWithOfferings.length, data: subjectsWithOfferings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/subjects/:id
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('branchId', 'name code description')
      .populate('semesterId', 'number');

    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Fetch all offerings for this canonical subject
    const offerings = await SubjectOffering.find({ subjectId: subject._id })
      .populate('branchId', 'name code description')
      .populate('semesterId', 'number');

    const plainObj = subject.toObject();
    plainObj.offerings = offerings;

    const branchMap = {};
    const semMap = {};
    offerings.forEach((o) => {
      if (o.branchId) branchMap[o.branchId._id ? o.branchId._id.toString() : o.branchId] = o.branchId;
      if (o.semesterNumber) semMap[o.semesterNumber] = true;
    });

    plainObj.branches = Object.values(branchMap);
    plainObj.semesterNumbers = Object.keys(semMap).map(Number).sort();

    if (plainObj.branches.length === 0 && plainObj.branchId) {
      plainObj.branches = [plainObj.branchId];
    }
    if (plainObj.semesterNumbers.length === 0 && plainObj.semesterNumber) {
      plainObj.semesterNumbers = [plainObj.semesterNumber];
    }

    res.json({ success: true, data: plainObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/subjects (Admin)
// Idempotently finds existing subject by code or normalized name, reuses canonical Subject document, and creates SubjectOffering.
exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, branchId, semesterId, semesterNumber, subjectType, type, credits } = req.body;

    const normalizedType = (subjectType || type || 'theory').toLowerCase();
    const cleanCode = code ? code.trim().toUpperCase() : '';
    const cleanName = name ? name.trim() : '';

    // Search for existing subject by code or exact normalized name
    let existingSubject = null;
    if (cleanCode) {
      existingSubject = await Subject.findOne({ code: cleanCode });
    }
    if (!existingSubject && cleanName) {
      const normReg = new RegExp('^' + cleanName.replace(/\s+/g, '\\s+') + '$', 'i');
      existingSubject = await Subject.findOne({ name: normReg });
    }

    let canonicalSubject;
    if (existingSubject) {
      // Reuse existing subject
      canonicalSubject = existingSubject;
      if (description && !canonicalSubject.description) {
        canonicalSubject.description = description;
        await canonicalSubject.save();
      }
    } else {
      // Create new canonical subject
      canonicalSubject = await Subject.create({
        name: cleanName,
        code: cleanCode,
        description: description || '',
        branchId: branchId || null,
        semesterId: semesterId || null,
        semesterNumber: semesterNumber || 1,
        subjectType: ['theory', 'lab', 'elective', 'other'].includes(normalizedType) ? normalizedType : 'theory',
        credits: credits !== undefined ? Number(credits) : 3,
      });
    }

    // Create or update SubjectOffering mapping for the branch & semester
    if (branchId) {
      let resolvedSemId = semesterId;
      if (!resolvedSemId) {
        const semDoc = await Semester.findOne({ number: Number(semesterNumber || 1), branchId });
        if (semDoc) resolvedSemId = semDoc._id;
      }

      if (resolvedSemId) {
        await SubjectOffering.findOneAndUpdate(
          {
            subjectId: canonicalSubject._id,
            branchId,
            semesterId: resolvedSemId,
          },
          {
            subjectId: canonicalSubject._id,
            branchId,
            semesterId: resolvedSemId,
            semesterNumber: Number(semesterNumber || 1),
            credits: credits !== undefined ? Number(credits) : 3,
          },
          { upsert: true, new: true }
        );
      }
    }

    const populated = await Subject.findById(canonicalSubject._id);
    const offerings = await SubjectOffering.find({ subjectId: canonicalSubject._id })
      .populate('branchId', 'name code')
      .populate('semesterId', 'number');

    const result = populated.toObject();
    result.offerings = offerings;

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/subjects/:id (Admin)
exports.updateSubject = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.subjectType || updateData.type) {
      const normalizedType = (updateData.subjectType || updateData.type).toLowerCase();
      if (['theory', 'lab', 'elective', 'other'].includes(normalizedType)) {
        updateData.subjectType = normalizedType;
      }
    }

    const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/subjects/:id (Admin)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    // Also delete offerings linked to this subject
    await SubjectOffering.deleteMany({ subjectId: req.params.id });

    res.json({ success: true, message: 'Subject and offerings deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
