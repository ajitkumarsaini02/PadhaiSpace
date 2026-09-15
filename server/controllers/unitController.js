const Unit = require('../models/Unit');

// @route GET /api/units
exports.getUnits = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subjectId } : {};
    const units = await Unit.find(filter).populate('subjectId', 'name').sort({ unitNumber: 1 });
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/units (Admin)
exports.createUnit = async (req, res) => {
  try {
    const { subjectId, unitNumber, title, description } = req.body;
    const unit = await Unit.create({ subjectId, unitNumber, title, description: description || '' });
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/units/:id (Admin)
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/units/:id (Admin)
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, message: 'Unit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
