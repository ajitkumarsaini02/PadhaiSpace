const SubjectOffering = require('../models/SubjectOffering');
const Subject = require('../models/Subject');

// @route GET /api/subject-offerings
exports.getSubjectOfferings = async (req, res) => {
  try {
    const { branchId, semesterId, semesterNumber, subjectId } = req.query;
    let filter = {};

    if (branchId) filter.branchId = branchId;
    if (semesterId) filter.semesterId = semesterId;
    if (semesterNumber) filter.semesterNumber = Number(semesterNumber);
    if (subjectId) filter.subjectId = subjectId;

    const offerings = await SubjectOffering.find(filter)
      .populate({
        path: 'subjectId',
        select: 'name code description subjectType type credits',
      })
      .populate('branchId', 'name code description')
      .populate('semesterId', 'number');

    res.json({ success: true, count: offerings.length, data: offerings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/subject-offerings (Admin)
exports.createSubjectOffering = async (req, res) => {
  try {
    const { subjectId, branchId, semesterId, semesterNumber, credits } = req.body;

    const offering = await SubjectOffering.findOneAndUpdate(
      {
        subjectId,
        branchId,
        semesterId,
      },
      {
        subjectId,
        branchId,
        semesterId,
        semesterNumber: semesterNumber || 1,
        credits: credits !== undefined ? Number(credits) : 3,
      },
      { upsert: true, new: true }
    )
      .populate('subjectId', 'name code description subjectType type credits')
      .populate('branchId', 'name code')
      .populate('semesterId', 'number');

    res.status(201).json({ success: true, data: offering });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/subject-offerings/:id (Admin)
exports.updateSubjectOffering = async (req, res) => {
  try {
    const offering = await SubjectOffering.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subjectId', 'name code description subjectType type credits')
      .populate('branchId', 'name code')
      .populate('semesterId', 'number');

    if (!offering) return res.status(404).json({ success: false, message: 'Subject offering not found' });
    res.json({ success: true, data: offering });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/subject-offerings/:id (Admin)
exports.deleteSubjectOffering = async (req, res) => {
  try {
    const offering = await SubjectOffering.findByIdAndDelete(req.params.id);
    if (!offering) return res.status(404).json({ success: false, message: 'Subject offering not found' });
    res.json({ success: true, message: 'Subject offering deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
