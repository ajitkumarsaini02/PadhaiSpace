const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// Ensure unit numbers inside a subject are unique
UnitSchema.index({ subjectId: 1, unitNumber: 1 }, { unique: true });

module.exports = mongoose.model('Unit', UnitSchema);

