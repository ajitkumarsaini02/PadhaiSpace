const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);

