const User = require('../models/User');

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizeName = (name = '') => name.trim();

// @desc    Get logged in user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email createdAt updatedAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc    Update logged in user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextName = req.body.name !== undefined ? normalizeName(req.body.name) : user.name;
    const nextEmail = req.body.email !== undefined ? normalizeEmail(req.body.email) : user.email;
    const nextPassword = req.body.password;

    if (!nextName || !nextEmail) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (nextEmail !== user.email) {
      const emailInUse = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (emailInUse) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = nextName;
    user.email = nextEmail;

    if (nextPassword) {
      if (String(nextPassword).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = String(nextPassword);
    }

    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { getProfile, updateProfile };
