import { Request, Response } from 'express';
import Follower from '../models/Follower';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiResponse } from '../types/api.types';
import { IFollower } from '../types/models.types';

// Helper to extract string from params
const getParamAsString = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// Follow a user
const followUser = async (
  req: AuthRequest,
  res: Response<ApiResponse<IFollower>>
): Promise<void> => {
  try {
    const followerUserId = req.user?.id; // From auth middleware
    const userId = getParamAsString(req.params.userId); // User to follow

    if (!followerUserId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    // Validate - can't follow yourself
    if (followerUserId === parseInt(userId, 10)) {
      res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
      return;
    }

    // Create follow relationship
    const follow = await Follower.create({
      follower_user_id: followerUserId,
      followed_user_id: parseInt(userId, 10)
    });

    if (!follow) {
      res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'User followed successfully',
      data: follow
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
const unfollowUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const followerUserId = req.user?.id;
    const userId = getParamAsString(req.params.userId);

    if (!followerUserId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const result = await Follower.delete(followerUserId, parseInt(userId, 10));

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Follow relationship not found'
      });
      return;
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
const getFollowers = async (
  req: Request<{ userId: string }>,
  res: Response<ApiResponse<any[]>>
): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.userId);

    const followers = await Follower.getFollowers(parseInt(userId, 10));

    res.status(200).json({
      success: true,
      data: followers
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
const getFollowing = async (
  req: Request<{ userId: string }>,
  res: Response<ApiResponse<any[]>>
): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.userId);

    const following = await Follower.getFollowing(parseInt(userId, 10));

    res.status(200).json({
      success: true,
      data: following
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
const checkFollowStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ isFollowing: boolean }>>
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const userId = getParamAsString(req.params.userId);

    if (!currentUserId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const isFollowing = await Follower.isFollowing(currentUserId, parseInt(userId, 10));

    res.status(200).json({
      success: true,
      data: { isFollowing }
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
const getFollowCounts = async (
  req: Request<{ userId: string }>,
  res: Response<ApiResponse<{ followerCount: number; followingCount: number }>>
): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.userId);

    const counts = await Follower.getCounts(parseInt(userId, 10));

    res.status(200).json({
      success: true,
      data: {
        followerCount: counts.followers_count,
        followingCount: counts.following_count
      }
    });
  } catch (error) {
    console.error('Get follow counts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching follow counts'
    });
  }
};

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowCounts
};
