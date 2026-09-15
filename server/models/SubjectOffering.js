const mongoose = require('mongoose');

const SubjectOfferingSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    semesterNumber: { type: Number, required: true, default: 1 },
    credits: { type: Number, default: 3 },
  },
  { timestamps: true }
);

// Prevent duplicate offerings for the same subject, branch & semester
SubjectOfferingSchema.index(
  { subjectId: 1, branchId: 1, semesterId: 1 },
  { unique: true }
);

module.exports = mongoose.model('SubjectOffering', SubjectOfferingSchema);
