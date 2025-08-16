const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/doctors
// @desc    Get all doctors
// @access  Private
router.get('/doctors', auth, async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      isActive: true 
    }).select('-password');

    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin, or own profile)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check authorization (admin or own profile)
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, or own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, specialty, department, experience, available } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    // Doctor-specific fields
    if (user.role === 'doctor') {
      if (specialty) user.specialty = specialty;
      if (department) user.department = department;
      if (experience) user.experience = experience;
      if (available !== undefined) user.available = available;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error while deactivating user' });
  }
});

// @route   POST /api/users/:id/activate
// @desc    Activate user (Admin only)
// @access  Private (Admin)
router.post('/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error while activating user' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAdmins
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
});

module.exports = router;