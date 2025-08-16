const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { 
  sendAppointmentConfirmation, 
  sendAdminNotification, 
  sendStatusUpdateNotification 
} = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Book new appointment
// @access  Private (Patient)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, symptoms, department, appointmentType } = req.body;

    // Validate doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor selected' });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $in: ['scheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      time,
      symptoms,
      department: department || doctor.department,
      appointmentType: appointmentType || 'consultation'
    });

    await appointment.save();

    // Populate appointment with patient and doctor details
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialty department');

    // Send confirmation email to patient
    await sendAppointmentConfirmation(appointment, appointment.patient, appointment.doctor);

    // Send notification email to admin
    await sendAdminNotification(appointment, appointment.patient, appointment.doctor);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Server error while booking appointment' });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // Admin can see all appointments (no filter)

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty department')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (Doctor, Admin)
router.put('/:id/status', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if doctor is updating their own appointment
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Send status update notification to patient if status changed
    if (oldStatus !== status && ['completed', 'cancelled', 'no-show'].includes(status)) {
      await sendStatusUpdateNotification(appointment, appointment.patient, appointment.doctor, status);
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error while updating appointment' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment details
// @access  Private (Patient - own appointments, Admin - all)
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, time, symptoms, appointmentType } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (symptoms !== undefined) appointment.symptoms = symptoms;
    if (appointmentType) appointment.appointmentType = appointmentType;

    await appointment.save();
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialty department');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error while updating appointment' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private (Patient - own appointments, Admin - all)
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Send cancellation notification
    await sendStatusUpdateNotification(appointment, appointment.patient, appointment.doctor, 'cancelled');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error while cancelling appointment' });
  }
});

// @route   GET /api/appointments/stats/overview
// @desc    Get appointment statistics
// @access  Private (Admin, Doctor)
router.get('/stats/overview', auth, authorize('admin', 'doctor'), async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'doctor') {
      matchQuery.doctor = req.user._id;
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments(matchQuery);
    const todayAppointments = await Appointment.countDocuments({
      ...matchQuery,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      success: true,
      stats: {
        total: totalAppointments,
        today: todayAppointments,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;