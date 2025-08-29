const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor.js');

dotenv.config();

const seedDoctor = async () => {
  try {
    await mongoose.connect("mongodb+srv://msainidev:Qj1PhbeA6lxdbTXW@cluster0.25vchsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    console.log("✅ MongoDB connected...");

    // Clear existing doctors
    await Doctor.deleteMany();

    const doctor = new Doctor({
      doctorId: "smith.doe",
      name: "Dr. Smith Doe",
      passwordHash: "Smith123", // plain, will be hashed by pre-save hook
    });

    await doctor.save();

    console.log("✅ Dummy doctor inserted successfully");
    console.log("Doctor ID:"+ doctor.doctorId);
    console.log("Password:"+ doctor.passwordHash);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting dummy doctor:", error.message);
    process.exit(1);
  }
};

seedDoctor();
