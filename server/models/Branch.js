const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'BookOpen' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', BranchSchema);
