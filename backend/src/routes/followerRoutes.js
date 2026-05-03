const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowCounts
} = require('../controllers/followerController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/followers/follow/:userId - Follow a user
router.post('/follow/:userId', verifyToken, followUser);

// DELETE /api/followers/unfollow/:userId - Unfollow a user
router.delete('/unfollow/:userId', verifyToken, unfollowUser);

// GET /api/followers/:userId/followers - Get user's followers
router.get('/:userId/followers', getFollowers);

// GET /api/followers/:userId/following - Get users that a user is following
router.get('/:userId/following', getFollowing);

// GET /api/followers/check/:userId - Check if current user is following another user
router.get('/check/:userId', verifyToken, checkFollowStatus);

// GET /api/followers/:userId/counts - Get follower and following counts
router.get('/:userId/counts', getFollowCounts);

module.exports = router;
