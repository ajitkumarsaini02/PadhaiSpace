const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Semester', SemesterSchema);

