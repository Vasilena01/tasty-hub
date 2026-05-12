import { Request, Response } from 'express';
import User from '../models/User';
import { ApiResponse } from '../types/api.types';
import { IUser } from '../types/models.types';

// Get user by ID (public profile info)
const getUserById = async (
  req: Request<{ userId: string }>,
  res: Response<ApiResponse<Omit<IUser, 'password_hash'>>>
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(parseInt(userId, 10));

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Return only public profile information (exclude password_hash)
    const { password_hash, ...publicProfile } = user;

    res.json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

export {
  getUserById
};
