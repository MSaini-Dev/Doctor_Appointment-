// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { Doctor } from '../models/Doctor.js';
import { validateLoginData } from '../middleware/auth.js';
import { responseUtils } from '../services/smsService.js';

const router = express.Router();

// Doctor login
router.post('/login', validateLoginData, async (req, res) => {
  try {
    const { doctorId, password } = req.body;
    console.log(doctorId, password);

    console.log(`🔐 Login attempt for doctor: ${doctorId}`);

    // Find doctor by doctorId
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) {
      console.log('❌ Doctor not found');
      return responseUtils.error(res, 'Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await doctor.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return responseUtils.error(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { doctorId: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Doctor login successful');

    responseUtils.success(res, {
      token,
      doctor: {
        id: doctor._id,
        doctorId: doctor.doctorId,
        name: doctor.name
      }
    }, 'Login successful');

  } catch (error) {
    console.error('❌ Login error:', error.message);
    responseUtils.error(res, 'Internal server error', 500);
  }
});

export default router;
