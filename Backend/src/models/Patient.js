const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  tokenNo: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'complete', 'cancelled'], default: 'pending' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
}, { timestamps: true });

// Compound unique index: Token number is unique per session
PatientSchema.index({ tokenNo: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Patient', PatientSchema);
