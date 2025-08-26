// routes/dashboard.js
import express from 'express';
import { TokenCounter } from '../models/TokenCounter.js';
import { Appointment } from '../models/Appointment.js';
import { authenticateDoctor } from '../middleware/auth.js';
import { dateUtils, responseUtils } from '../services/smsService.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateDoctor, async (req, res) => {
  try {
    const today = dateUtils.getCurrentDate();
    const dailyLimit = parseInt(process.env.DAILY_TOKEN_LIMIT) || 100;

    // Get today's appointments
    const appointments = await Appointment.find({ dateOnly: today })
      .sort({ tokenNumber: 1 })
      .select('name phone tokenNumber status smsStatus createdAt');

    // Get token counter
    const tokenCounter = await TokenCounter.findOne({ date: today });
    const issuedTokens = tokenCounter?.count || 0;
    const remainingTokens = Math.max(0, dailyLimit - issuedTokens);

    // Calculate stats
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const successfulSMS = appointments.filter(apt => apt.smsStatus === 'sent').length;
    const totalSMS = appointments.length;
    const smsSuccessRate = totalSMS > 0 ? Math.round((successfulSMS / totalSMS) * 100) : 100;

    console.log(`📊 Dashboard stats - Issued: ${issuedTokens}, Remaining: ${remainingTokens}`);

    responseUtils.success(res, {
      displayDate: dateUtils.formatDisplayDate(new Date()),
      stats: {
        totalLimit: dailyLimit,
        issuedTokens,
        remainingTokens,
        completedAppointments,
        smsSuccessRate
      },
      appointments: appointments.map(apt => ({
        id: apt._id,
        name: apt.name,
        phone: apt.phone,
        tokenNumber: apt.tokenNumber,
        status: apt.status,
        smsStatus: apt.smsStatus,
        time: dateUtils.formatDisplayDateTime(apt.createdAt)
      }))
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error.message);
    responseUtils.error(res, 'Failed to fetch dashboard data', 500);
  }
});

router.post('/reset-tokens', authenticateDoctor, async (req, res) => {
  try {
    const today = dateUtils.getCurrentDate();
    const { clearAppointments } = req.body; // boolean

    // Reset token counter
    await TokenCounter.resetDailyTokens(today);

    if (clearAppointments) {
      // Delete or archive today's appointments - here deleting for example
      await Appointment.deleteMany({ dateOnly: today });
    } else {
      // Just mark pending appointments as cancelled (existing behavior)
      await Appointment.updateMany(
        { dateOnly: today, status: 'pending' },
        { status: 'cancelled' }
      );
    }
    
    console.log('🔄 Daily tokens reset successfully');
    responseUtils.success(res, null, 'Tokens reset successfully');
  } catch (error) {
    console.error('❌ Token reset error:', error.message);
    responseUtils.error(res, 'Failed to reset tokens', 500);
  }
});


// Update appointment status
router.put('/appointment/:id/status', authenticateDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return responseUtils.error(res, 'Invalid status', 400);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return responseUtils.error(res, 'Appointment not found', 404);
    }

    console.log(`✅ Appointment ${id} status updated to ${status}`);

    responseUtils.success(res, {
      id: appointment._id,
      status: appointment.status
    }, 'Status updated successfully');

  } catch (error) {
    console.error('❌ Status update error:', error.message);
    responseUtils.error(res, 'Failed to update status', 500);
  }
});

export default router;
