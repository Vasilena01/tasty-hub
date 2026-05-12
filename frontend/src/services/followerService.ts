import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api.types';

const API_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FollowResponse extends ApiResponse {
  isFollowing?: boolean;
}

interface FollowCountsResponse extends ApiResponse {
  followers_count: number;
  following_count: number;
}

// Follow a user
const followUser = async (userId: number, token: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await axios.post(
    `${API_URL}/followers/follow/${userId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Unfollow a user
const unfollowUser = async (userId: number, token: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await axios.delete(
    `${API_URL}/followers/unfollow/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Get user's followers
const getFollowers = async (userId: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await axios.get(`${API_URL}/followers/${userId}/followers`);
  return response.data;
};

// Get users that a user is following
const getFollowing = async (userId: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await axios.get(`${API_URL}/followers/${userId}/following`);
  return response.data;
};

// Check if current user is following another user
const checkFollowStatus = async (userId: number, token: string): Promise<FollowResponse> => {
  const response: AxiosResponse<FollowResponse> = await axios.get(
    `${API_URL}/followers/check/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Get follower and following counts
const getFollowCounts = async (userId: number): Promise<FollowCountsResponse> => {
  const response: AxiosResponse<FollowCountsResponse> = await axios.get(`${API_URL}/followers/${userId}/counts`);
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
