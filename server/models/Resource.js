const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { 
      type: String, 
      required: true, 
      enum: ['notes', 'pdf', 'pyq', 'syllabus', 'exam-resource', 'other'] 
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },


    fileUrl: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    examYear: { type: Number, default: null },
    examType: { type: String, enum: ['Mid Semester', 'End Semester', 'University Exam', 'Other', ''], default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);
