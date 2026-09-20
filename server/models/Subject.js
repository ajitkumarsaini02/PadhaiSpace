const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    academicYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);


