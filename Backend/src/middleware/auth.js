// middleware/auth.js
const jwt = require('jsonwebtoken');
const { Doctor } = require('../models/Doctor.js');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find doctor (make sure your token payload has doctorId)
    const doctor = await Doctor.findById(decoded.doctorId).select('-passwordHash');

    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    // Add doctor to request object
    req.doctor = doctor;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;
