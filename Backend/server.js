const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Doctor = require('./src/models/Doctor.js');
const Session = require('./src/models/Session.js');
const Patient = require('./src/models/Patient.js');
const { validateLoginData } = require('./src/middleware/validation.js');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const SettingsSchema = new mongoose.Schema({
  defaultCheckin: { type: String, default: '09:00' },
  defaultCheckout: { type: String, default: '17:00' },
  holidays: { type: [String], default: [] },
  weeklyHolidays: { type: [String], default: ['Sunday'] }, // Days of week that are always holidays
  defaultTokenNo: { type: Number, default: 1 },
});
const Settings = mongoose.model('Settings', SettingsSchema);

function getDayName(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateString).getDay()];
}

async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
}

function isHoliday(date, settings) {
  const dayName = getDayName(date);
  return settings.holidays.includes(date) || settings.weeklyHolidays.includes(dayName);
}
app.get('/', (req, res) => {
  res.send('Doctor Appointment Management Backend is running.');
});
// HOLIDAY MANAGEMENT
app.post('/holidays', async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Date required.' });
  
  const settings = await getSettings();
  if (!settings.holidays.includes(date)) {
    settings.holidays.push(date);
    await settings.save();
    await Session.deleteMany({ date });
    res.json({ success: true, message: 'Holiday added and sessions deleted.' });
  } else {
    res.status(400).json({ error: 'Already a holiday.' });
  }
});

app.delete('/holidays/:date', async (req, res) => {
  const { date } = req.params;
  const settings = await getSettings();
  settings.holidays = settings.holidays.filter(d => d !== date);
  await settings.save();
  res.json({ success: true, message: 'Holiday removed.' });
});

// WEEKLY HOLIDAYS MANAGEMENT
app.post('/weekly-holidays', async (req, res) => {
  const { day } = req.body;
  const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (!validDays.includes(day)) {
    return res.status(400).json({ error: 'Invalid day. Must be one of: ' + validDays.join(', ') });
  }
  
  const settings = await getSettings();
  if (!settings.weeklyHolidays.includes(day)) {
    settings.weeklyHolidays.push(day);
    await settings.save();
    
    // Delete existing sessions that fall on this day
    const sessions = await Session.find({});
    for (const session of sessions) {
      if (getDayName(session.date) === day) {
        await Session.findByIdAndDelete(session._id);
      }
    }
    
    res.json({ success: true, message: `${day} added as weekly holiday and existing sessions deleted.` });
  } else {
    res.status(400).json({ error: `${day} is already a weekly holiday.` });
  }
});

app.delete('/weekly-holidays/:day', async (req, res) => {
  const { day } = req.params;
  const settings = await getSettings();
  settings.weeklyHolidays = settings.weeklyHolidays.filter(d => d !== day);
  await settings.save();
  res.json({ success: true, message: `${day} removed from weekly holidays.` });
});

// SESSION MANAGEMENT
app.get('/sessions', async (req, res) => {
  const today = new Date().toISOString().substring(0, 10);
  await Session.deleteMany({ date: { $lt: today } });
  const sessions = await Session.find({ date: { $gte: today } }).sort({ date: 1, checkin: 1 });
  res.json(sessions);
});

app.get('/sessions/live-summary', async (req, res) => {
  try {
    const today = new Date().toISOString().substring(0, 10);
    const liveSession = await Session.findOne({ date: today, isActive: true });
    
    let completedPatients = 0;
    if (liveSession) {
      completedPatients = await Patient.countDocuments({ 
        sessionId: liveSession._id, 
        status: 'complete' 
      });
    }
    
    const settings = await getSettings();
    const todayDayName = getDayName(today);
    const isTodayHoliday = isHoliday(today, settings);
    
    res.json({
      liveSession,
      completedPatients,
      isTodayHoliday,
      todayStatus: isTodayHoliday ? 'Holiday' : (liveSession ? 'Active' : 'Offline')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/sessions', async (req, res) => {
  try {
    const { date, checkin, checkout, totalTokens } = req.body;
    if (!date || !checkin || !checkout || !totalTokens) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const settings = await getSettings();
    if (isHoliday(date, settings)) {
      return res.status(403).json({ 
        error: `Cannot create session on ${date}. This date is marked as a holiday or falls on ${getDayName(date)} which is a weekly holiday.` 
      });
    }

    const existing = await Session.findOne({ date, checkin, checkout });
    if (existing) {
      return res.status(400).json({ error: 'Session already exists for this date/time.' });
    }

    const session = new Session({ date, checkin, checkout, totalTokens });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    
    // Delete all patients associated with this session
    await Patient.deleteMany({ sessionId: req.params.id });
    
    res.json({ success: true, message: 'Session and associated patients deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/sessions/:id/start', async (req, res) => {
  try {
    // First, make sure no other session is active today
    const today = new Date().toISOString().substring(0, 10);
    await Session.updateMany(
      { date: today, isActive: true },
      { isActive: false }
    );

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    
    session.isActive = true;
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/sessions/:id/stop', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    session.isActive = false;
    await session.save();
    res.json({ success: true, message: 'Session stopped.', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SMS-BASED PATIENT REGISTRATION
app.post("/", async (req, res) => {
  try {
    const number  = req.body.no;
    const match = number.match(/\d{10}$/);

if (match) {
  const phone = match[0];
  console.log(phone); // "9876543210"

    const smsData = {
      from: match,      // sender number
      message: req.body.key,  // SMS text (should contain patient name)
      time: req.body.time     // SMS time
    };} else {
  return res.status(400).json({ error: 'Invalid phone number format. Must contain'})
        }    // Validate required fields
    if (!smsData.from || !smsData.message) {
      return res.status(400).json({ 
        error: 'Phone number and message required',
        received: smsData
      });
    }

    // Extract phone number and clean it (remove non-digits)
    const phone = smsData.from.replace(/\D/g, '');
    
    // Validate phone number (10 digits)
    if (phone.length !== 10) {
      return res.status(400).json({ 
        error: 'Phone number must be exactly 10 digits',
        received: smsData.from
      });
    }

    // Extract patient name from message (first word or entire message)
    const name = smsData.message.trim();
    if (!name) {
      return res.status(400).json({ 
        error: 'Patient name is required in the message',
        received: smsData.message
      });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().substring(0, 10);
    
    // Find today's active session
    const session = await Session.findOne({ 
      date: today,
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'No active session found for today',
        date: today,
        message: 'Please try again during clinic hours'
      });
    }

    // Check if this phone number already has a booking for this session
    const existingPatient = await Patient.findOne({ 
      phone, 
      sessionId: session._id 
    });
    
    if (existingPatient) {
      return res.status(400).json({ 
        error: `Already registered for today's session`,
        tokenNo: existingPatient.tokenNo,
        status: existingPatient.status
      });
    }

    // Check if session has available tokens
    if (session.currentToken >= session.totalTokens) {
      return res.status(400).json({ 
        error: 'No tokens available for today\'s session',
        totalTokens: session.totalTokens,
        currentToken: session.currentToken
      });
    }

    // Register the patient
    session.currentToken += 1;
    await session.save();
    
    const tokenNo = session.currentToken;
    const patient = new Patient({ 
      tokenNo, 
      name, 
      phone, 
      sessionId: session._id 
    });
    
    await patient.save();
    
    // Success response
    res.json({ 
      success: true,
      message: 'Appointment booked successfully via SMS!',
      tokenNo,
      patient: {
        name,
        phone,
        sessionDate: session.date,
        sessionTime: `${session.checkin} - ${session.checkout}`
      }
    });

  } catch (err) {
    console.error('SMS registration error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
});
// PATIENT MANAGEMENT
app.post('/patient', async (req, res) => {
  try {
    const { name, phone, sessionId } = req.body;
    
    if (!name || !phone || !sessionId) {
      return res.status(400).json({ error: 'Name, phone and sessionId required' });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    // Check if this phone number already has a booking for this session
    const existingPatient = await Patient.findOne({ phone, sessionId });
    if (existingPatient) {
      return res.status(400).json({ 
        error: `This phone number already has a booking for this session. Token number: ${existingPatient.tokenNo}` 
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.currentToken >= session.totalTokens) {
      return res.status(400).json({ error: 'No tokens available for this session' });
    }

    session.currentToken += 1;
    await session.save();
    
    const tokenNo = session.currentToken;
    const patient = new Patient({ tokenNo, name, phone, sessionId });
    await patient.save();
    
    res.json({ tokenNo, message: 'Appointment booked successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/patients', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const filter = {};
    if (sessionId) filter.sessionId = sessionId;
    const patients = await Patient.find(filter).sort({ tokenNo: 1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/patients/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'complete', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, complete, or cancelled.' });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    res.json({ success: true, message: 'Patient status updated successfully', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DOCTOR LOGIN ENDPOINT
app.post('/login', validateLoginData, async (req, res) => {
  try {
    const { doctorId, password } = req.body;
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const isValid = await doctor.comparePassword(password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const token = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      success: true, 
      token, 
      doctor: { id: doctor._id, doctorId: doctor.doctorId, name: doctor.name } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get current clinic settings
app.get('/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
app.patch('/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    const { defaultCheckin, defaultCheckout } = req.body;
    
    if (defaultCheckin) settings.defaultCheckin = defaultCheckin;
    if (defaultCheckout) settings.defaultCheckout = defaultCheckout;
    
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});