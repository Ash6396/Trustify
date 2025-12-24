const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['donor', 'creator', 'admin'], required: true, default: 'donor' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
