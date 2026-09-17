const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { 
      type: String, 
      required: true, 
      enum: ['notes', 'unit-pdf', 'pyq', 'syllabus', 'exam-resource', 'pdf', 'other'],
      lowercase: true,
    },
    source: { type: String, default: '' },
    academicYear: { type: String, default: '' }, // e.g. '1st Year', '2nd Year', '3rd Year', '4th Year'
    paperYear: { type: Number, default: null }, // Actual question paper year, e.g. 2025
    year: { type: Number, default: null }, // General year if applicable
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
    fileUrl: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ResourceSchema.index({ subjectId: 1 });
ResourceSchema.index({ unitId: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ academicYear: 1 });
ResourceSchema.index({ paperYear: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);

