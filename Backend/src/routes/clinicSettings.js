// routes/clinicSettings.js

import express from 'express';
import { ClinicSettings } from '../models/ClinicSettings.js';
import { authenticateDoctor } from '../middleware/auth.js';
import { dateUtils, responseUtils } from '../services/smsService.js';

const router = express.Router();

// Get settings for today or requested date
router.get('/', authenticateDoctor, async (req, res) => {
  try {
    const { date } = req.query;
    const effectiveDate = date || dateUtils.getCurrentDate();
    const settings = await ClinicSettings.getEffectiveSettings(effectiveDate);
    responseUtils.success(res, settings, 'Clinic settings fetched');
  } catch (error) {
    console.error('❌ Clinic settings fetch error:', error.message);
    responseUtils.error(res, 'Failed to fetch clinic settings', 500);
  }
});

// Update settings for a given date
router.put('/', authenticateDoctor, async (req, res) => {
  try {
    const { date, dailyTokenLimit, openTime, closeTime, holidays, isIssuancePaused } = req.body;

    if (!date) {
      return responseUtils.error(res, 'Date is required to update settings', 400);
    }

    const updateData = {};
    
    if (dailyTokenLimit !== undefined) {
      if (typeof dailyTokenLimit !== 'number' || dailyTokenLimit < 1) {
        return responseUtils.error(res, 'Invalid dailyTokenLimit', 400);
      }
      updateData.dailyTokenLimit = dailyTokenLimit;
    }

    if (openTime !== undefined) updateData.openTime = openTime;
    if (closeTime !== undefined) updateData.closeTime = closeTime;
    if (holidays !== undefined && Array.isArray(holidays)) updateData.holidays = holidays;
    if (isIssuancePaused !== undefined) updateData.isIssuancePaused = isIssuancePaused;
    updateData.lastUpdated = new Date();

    const settings = await ClinicSettings.findOneAndUpdate(
      { date },
      updateData,
      { upsert: true, new: true }
    );

    responseUtils.success(res, settings, 'Clinic settings updated');
  } catch (error) {
    console.error('❌ Clinic settings update error:', error.message);
    responseUtils.error(res, 'Failed to update clinic settings', 500);
  }
});

export default router;
