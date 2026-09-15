const Semester = require('../models/Semester');

// @route GET /api/semesters
exports.getSemesters = async (req, res) => {
  try {
    const { branchId } = req.query;
    let filter = {};
    if (branchId) filter.branchId = branchId;

    const semesters = await Semester.find(filter)
      .populate('branchId', 'name code')
      .sort({ number: 1 });

    res.json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/semesters (Admin)
exports.createSemester = async (req, res) => {
  try {
    const { number, branchId } = req.body;
    const semester = await Semester.create({ number, branchId });
    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/semesters/:id (Admin)
exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/semesters/:id (Admin)
exports.deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.json({ success: true, message: 'Semester removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
