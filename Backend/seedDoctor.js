const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor.js');

dotenv.config();

const seedDoctor = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/clinicApp");

    console.log("✅ MongoDB connected...");

    // Clear existing doctors
    await Doctor.deleteMany();

    const doctor = new Doctor({
      doctorId: "m.saini.dev@gmail.com",
      name: "Dr. John Doe",
      passwordHash: "12345678", // plain, will be hashed by pre-save hook
    });

    await doctor.save();

    console.log("✅ Dummy doctor inserted successfully");
    console.log("👉 Login with:");
    console.log("Doctor ID: m.saini.dev@gmail.com");
    console.log("Password: 12345678");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting dummy doctor:", error.message);
    process.exit(1);
  }
};

seedDoctor();
