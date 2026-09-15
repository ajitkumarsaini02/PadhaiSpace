const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    subjectType: {
      type: String,
      enum: ['theory', 'lab', 'elective', 'other'],
      default: 'theory',
      lowercase: true,
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
    semesterNumber: { type: Number, default: 1 },
    credits: { type: Number, default: 3 },
    price: { type: Number, default: 9 },
    isPaid: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SubjectSchema.virtual('type').get(function () {
  return this.subjectType;
});

module.exports = mongoose.model('Subject', SubjectSchema);
