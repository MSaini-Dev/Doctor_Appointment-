// middleware/validation.js

// Appointment data validator
const validateAppointmentData = (req, res, next) => {
  const { name, phone } = req.body;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be a non-empty string',
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be less than 100 characters',
    });
  }

  // Validate phone
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required',
    });
  }

  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format',
    });
  }

  // Sanitize data
  req.body.name = name.trim();
  req.body.phone = phone.trim();

  next();
};

// Doctor login validator
const validateLoginData = (req, res, next) => {
  const { doctorId, password } = req.body;

  if (!doctorId || !password) {
    return res.status(400).json({
      success: false,
      message: 'Doctor ID and password are required',
    });
  }

  if (typeof doctorId !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format',
    });
  }

  next();
};

module.exports = {
  validateAppointmentData,
  validateLoginData,
};
