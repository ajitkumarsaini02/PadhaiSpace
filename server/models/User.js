const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    college: { type: String, default: '' },
    branch: { type: String, default: 'CSE' },
    semester: { type: Number, default: 1 },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

