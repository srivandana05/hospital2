const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Required to hash passwords

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Load User model
    const User = require('../models/User');

    // Create default admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@hospital.com' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const defaultAdmin = new User({
        name: 'Hospital Administrator',
        email: 'admin@hospital.com',
        password: hashedPassword,
        phone: '+1-555-0001',
        role: 'admin',
      });

      await defaultAdmin.save();
      console.log('🛡️ Default admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create default doctors if none exist
    const doctorCount = await User.countDocuments({ role: 'doctor' });

    if (doctorCount === 0) {
      const defaultDoctors = [
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          password: 'doctor123',
          phone: '+1-555-0101',
          role: 'doctor',
          specialty: 'Cardiology',
          department: 'Heart Care',
          experience: '15 years',
          image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hospital.com',
          password: 'doctor123',
          phone: '+1-555-0102',
          role: 'doctor',
          specialty: 'Orthopedics',
          department: 'Bone & Joint',
          experience: '12 years',
          image: 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        },
        {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@hospital.com',
          password: 'doctor123',
          phone: '+1-555-0103',
          role: 'doctor',
          specialty: 'Pediatrics',
          department: 'Child Care',
          experience: '10 years',
          image: 'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        },
      ];

      // Hash and save each doctor
      for (const doctorData of defaultDoctors) {
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);
        const doctor = new User({ ...doctorData, password: hashedPassword });
        await doctor.save();
      }

      console.log('🩺 Default doctors created');
    } else {
      console.log('ℹ️ Doctors already exist');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
