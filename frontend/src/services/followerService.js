import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Follow a user
const followUser = async (userId, token) => {
  const response = await axios.post(
    `${API_URL}/followers/follow/${userId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Unfollow a user
const unfollowUser = async (userId, token) => {
  const response = await axios.delete(
    `${API_URL}/followers/unfollow/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Get user's followers
const getFollowers = async (userId) => {
  const response = await axios.get(`${API_URL}/followers/${userId}/followers`);
  return response.data;
};

// Get users that a user is following
const getFollowing = async (userId) => {
  const response = await axios.get(`${API_URL}/followers/${userId}/following`);
  return response.data;
};

// Check if current user is following another user
const checkFollowStatus = async (userId, token) => {
  const response = await axios.get(
    `${API_URL}/followers/check/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Get follower and following counts
const getFollowCounts = async (userId) => {
  const response = await axios.get(`${API_URL}/followers/${userId}/counts`);
  return response.data;
};

const followerService = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowCounts
};

export default followerService;
