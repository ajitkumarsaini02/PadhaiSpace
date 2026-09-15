const Branch = require('../models/Branch');

// @route GET /api/branches
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({}).sort({ name: 1 });
    res.json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/branches (Admin)
exports.createBranch = async (req, res) => {
  try {
    const { name, code, description, icon } = req.body;
    const branch = await Branch.create({ name, code: code.toLowerCase(), description, icon });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/branches/:id (Admin)
exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/branches/:id (Admin)
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
