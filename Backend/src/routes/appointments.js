// routes/appointments.js
import express from 'express';
import { TokenCounter} from '../models/TokenCounter.js';
import { Appointment} from '../models/Appointment.js';
import { validateAppointmentData } from '../middleware/auth.js';
import { smsService } from '../services/smsService.js';
import { dateUtils, responseUtils } from '../services/smsService.js';
import { ClinicSettings } from '../models/ClinicSettings.js';
const router = express.Router();

// Book appointment
router.post('/book', validateAppointmentData, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const today = dateUtils.getCurrentDate();
   const settings = await ClinicSettings.getEffectiveSettings(today);

    // Check if today is a holiday
    if (settings.holidays.includes(today)) {
      return responseUtils.error(res, 'Clinic is closed today (holiday)', 403);
    }

    // Check if issuance is paused
    if (settings.isIssuancePaused) {
      return responseUtils.error(res, 'Token issuance is currently paused', 403);
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm

    // Check clinic open/close time
    if (currentTime < settings.openTime || currentTime > settings.closeTime) {
      return responseUtils.error(res, `Booking allowed only during clinic hours: ${settings.openTime} - ${settings.closeTime}`, 403);
    }

    console.log(`📝 Booking appointment for ${name} (${phone})`);

    // Check if user already has appointment today
    const existingAppointment = await Appointment.findOne({
      phone,
      dateOnly: today
    });

    if (existingAppointment) {
      return responseUtils.error(res, 
        `You already have an appointment today. Token number: ${existingAppointment.tokenNumber}`, 
        400
      );
    }

    let tokenNumber;
    let appointment;

    try {
      // Get next token number atomically
      tokenNumber = await TokenCounter.getNextToken(today);

      // Create appointment
      appointment = new Appointment({
        name,
        phone,
        tokenNumber,
        dateOnly: today
      });

      await appointment.save();
      console.log(`✅ Token ${tokenNumber} assigned to ${name}`);

    } catch (error) {
      if (error.message === 'Daily token limit exceeded') {
        // Send "no tokens available" SMS
        try {
          const noTokensMessage = smsService.generateNoTokensMessage(name);
          await smsService.sendSMS(phone, noTokensMessage);
        } catch (smsError) {
          console.error('❌ SMS sending failed:', smsError.message);
        }

        return responseUtils.error(res, 'No more tokens available for today', 400);
      }
      throw error;
    }

    // Send confirmation SMS
    try {
      // const confirmationMessage = smsService.generateConfirmationMessage(name, tokenNumber);
      // const smsResult = await smsService.sendSMS(phone, confirmationMessage);
      
      // // Update SMS status
      // appointment.smsStatus = smsResult.success ? 'sent' : 'failed';
      // await appointment.save();
      const smsResult = { success: true }; // Mock result for now
      console.log(`📱 SMS ${smsResult.success ? 'sent' : 'failed'} to ${phone}`);
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError.message);
      appointment.smsStatus = 'failed';
      await appointment.save();
    }

    responseUtils.success(res, {
      tokenNumber,
      name,
      phone,
      date: dateUtils.formatDisplayDate(new Date())
    }, `Token ${tokenNumber} assigned successfully`);

  } catch (error) {
    console.error('❌ Appointment booking error:', error.message);
    responseUtils.error(res, 'Failed to book appointment', 500);
  }
});

// Check appointment status
router.get('/status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const today = dateUtils.getCurrentDate();

    const appointment = await Appointment.findOne({
      phone,
      dateOnly: today
    });

    if (!appointment) {
      return responseUtils.error(res, 'No appointment found for today', 404);
    }

    responseUtils.success(res, {
      tokenNumber: appointment.tokenNumber,
      name: appointment.name,
      status: appointment.status,
      date: dateUtils.formatDisplayDate(appointment.date)
    });

  } catch (error) {
    console.error('❌ Status check error:', error.message);
    responseUtils.error(res, 'Failed to check status', 500);
  }
});

export default router;
