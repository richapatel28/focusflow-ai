const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  preferences: {
    workHours:     { type: Number,  default: 8 },
    breakInterval: { type: Number,  default: 60 },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);