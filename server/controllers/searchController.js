const Subject = require('../models/Subject');
const SubjectOffering = require('../models/SubjectOffering');
const Resource = require('../models/Resource');

// @route GET /api/search?q=...
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, subjects: [], resources: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const canonicalSubjects = await Subject.find({
      $or: [{ name: regex }, { code: regex }, { description: regex }],
    })
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .limit(10);

    // Deduplicate by Subject _id
    const uniqueSubjectMap = {};
    const subjectIds = [];

    canonicalSubjects.forEach((s) => {
      const idStr = s._id.toString();
      if (!uniqueSubjectMap[idStr]) {
        uniqueSubjectMap[idStr] = s.toObject();
        subjectIds.push(s._id);
      }
    });

    // Populate offering details for matched subjects
    const offerings = await SubjectOffering.find({ subjectId: { $in: subjectIds } })
      .populate('branchId', 'name code')
      .populate('semesterId', 'number');

    offerings.forEach((off) => {
      const sId = off.subjectId.toString();
      if (uniqueSubjectMap[sId]) {
        if (!uniqueSubjectMap[sId].branches) uniqueSubjectMap[sId].branches = [];
        if (off.branchId && !uniqueSubjectMap[sId].branches.some((b) => b._id.toString() === off.branchId._id.toString())) {
          uniqueSubjectMap[sId].branches.push(off.branchId);
        }
      }
    });

    const deduplicatedSubjects = Object.values(uniqueSubjectMap);

    const resources = await Resource.find({
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .populate('branchId', 'name code')
      .populate('semesterId', 'number')
      .populate('subjectId', 'name code')
      .populate('unitId', 'unitNumber title')
      .limit(20);

    res.json({
      success: true,
      query: q,
      subjects: deduplicatedSubjects,
      resources,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
