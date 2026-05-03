const User = require('../models/User');

// Get user by ID (public profile info)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return only public profile information (exclude password_hash)
    const { password_hash, ...publicProfile } = user;

    res.json({
      success: true,
      user: publicProfile
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

module.exports = {
  getUserById
};
