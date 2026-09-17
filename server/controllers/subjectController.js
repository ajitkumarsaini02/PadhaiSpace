const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Unit = require('../models/Unit');

// @route GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const { q } = req.query;
    let subjectFilter = {};

    if (q) {
      subjectFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(subjectFilter).sort({ name: 1 });
    const subjectIds = subjects.map((s) => s._id);

    // Resource and Unit count per subject
    const [resCounts, unitCounts] = await Promise.all([
      Resource.aggregate([
        { $match: { subjectId: { $in: subjectIds } } },
        { $group: { _id: '$subjectId', count: { $sum: 1 } } },
      ]),
      Unit.aggregate([
        { $match: { subjectId: { $in: subjectIds } } },
        { $group: { _id: '$subjectId', count: { $sum: 1 } } },
      ]),
    ]);

    const resCountMap = {};
    resCounts.forEach((c) => {
      resCountMap[c._id.toString()] = c.count;
    });

    const unitCountMap = {};
    unitCounts.forEach((c) => {
      unitCountMap[c._id.toString()] = c.count;
    });

    const data = subjects.map((s) => {
      const plainObj = s.toObject();
      plainObj.resourceCount = resCountMap[s._id.toString()] || 0;
      plainObj.unitCount = unitCountMap[s._id.toString()] || 0;
      return plainObj;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/subjects/:id
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const [resourceCount, unitCount] = await Promise.all([
      Resource.countDocuments({ subjectId: subject._id }),
      Unit.countDocuments({ subjectId: subject._id }),
    ]);

    const plainObj = subject.toObject();
    plainObj.resourceCount = resourceCount;
    plainObj.unitCount = unitCount;

    res.json({ success: true, data: plainObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/subjects (Admin)
exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, thumbnail } = req.body;

    const cleanCode = code ? code.trim().toUpperCase() : '';
    const cleanName = name ? name.trim() : '';

    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }
    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Subject code is required' });
    }

    const subject = await Subject.create({
      name: cleanName,
      code: cleanCode,
      description: description || '',
      thumbnail: thumbnail || '',
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/subjects/:id (Admin)
exports.updateSubject = async (req, res) => {
  try {
    const { name, code, description, thumbnail } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

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

    // Delete linked units and resources
    await Unit.deleteMany({ subjectId: req.params.id });
    await Resource.deleteMany({ subjectId: req.params.id });

    res.json({ success: true, message: 'Subject, linked units, and resources deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
