const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  checkin: { type: String, required: true },
  checkout: { type: String, required: true },
  totalTokens: { type: Number, required: true },
  currentToken: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
