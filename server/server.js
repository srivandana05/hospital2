// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/database.js'; // 👈 Make sure your database file is .js or .mjs with ES syntax

// import authRoutes from './routes/auth.js';
// import appointmentRoutes from './routes/appointments.js';
// import userRoutes from './routes/users.js';

// dotenv.config();
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://your-frontend-domain.com'] 
//     : ['http://localhost:5173', 'http://localhost:3000'],
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/users', userRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'Hospital Booking System API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false, 
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // 404
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     message: 'API endpoint not found' 
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
// });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const appointmentRoutes = require("./routes/appointments");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Check Mongo URI from .env
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

