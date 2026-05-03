const Follower = require('../models/Follower');

// Follow a user
const followUser = async (req, res) => {
  try {
    const followerUserId = req.user.id; // From auth middleware
    const { userId } = req.params; // User to follow

    // Validate - can't follow yourself
    if (followerUserId === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    // Create follow relationship
    const follow = await Follower.create({
      follower_user_id: followerUserId,
      followed_user_id: parseInt(userId)
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User followed successfully',
      follow
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while following user'
    });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const followerUserId = req.user.id;
    const { userId } = req.params;

    const result = await Follower.delete(followerUserId, parseInt(userId));

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Follow relationship not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while unfollowing user'
    });
  }
};

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follower.getFollowers(parseInt(userId));

    res.status(200).json({
      success: true,
      followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching followers'
    });
  }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follower.getFollowing(parseInt(userId));

    res.status(200).json({
      success: true,
      following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching following'
    });
  }
};

// Check if current user is following another user
const checkFollowStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const isFollowing = await Follower.isFollowing(currentUserId, parseInt(userId));

    res.status(200).json({
      success: true,
      isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking follow status'
    });
  }
};

// Get follower and following counts for a user
const getFollowCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const counts = await Follower.getCounts(parseInt(userId));

    res.status(200).json({
      success: true,
      counts
    });
  } catch (error) {
    console.error('Get follow counts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching follow counts'
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowCounts
};
