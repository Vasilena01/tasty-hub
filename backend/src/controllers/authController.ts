import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiResponse, RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types';
import { IUser } from '../types/models.types';
import { Pool, QueryResult } from 'pg';
import pool from '../config/database';

// Request body interface for registration
interface RegisterRequestBody extends RegisterRequest {
  // RegisterRequest already has all fields
}

// Request body interface for login
interface LoginRequestBody extends LoginRequest {
  // LoginRequest already has all fields
}

// Request body interface for profile update
interface UpdateProfileRequestBody {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
}

// Interface for user discovery results
interface UserDiscoveryResult {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  recipe_count: string;
  followers_count: string;
}

// Register new user
const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Validate all fields are present
    if (!username || !email || !password || !first_name || !last_name) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'All fields are required'
      });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Password must be at least 8 characters'
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Email already registered'
      });
      return;
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Username already taken'
      });
      return;
    }

    // Hash password
    const password_hash: string = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      first_name,
      last_name
    });

    // Generate JWT token
    const token: string = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture_url: user.profile_picture_url
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      token: '',
      user: {} as any,
      error: 'Server error during registration'
    });
  }
};

// Login existing user
const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate both fields are present
    if (!email || !password) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Email and password are required'
      });
      return;
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Invalid email or password'
      });
      return;
    }

    // Verify password
    const isMatch: boolean = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        token: '',
        user: {} as any,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token: string = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Exclude password_hash from response
    const { password_hash: _password } = user;

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture_url: user.profile_picture_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      token: '',
      user: {} as any,
      error: 'Server error during login'
    });
  }
};

// Update user profile
const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse<IUser>>
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { first_name, last_name, email, username } = req.body as UpdateProfileRequestBody;

    // Validate at least one field is provided
    if (!first_name && !last_name && !email && !username) {
      res.status(400).json({
        success: false,
        error: 'At least one field is required to update'
      });
      return;
    }

    // If email is being changed, check if it's already taken
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail && existingEmail.id !== userId) {
        res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
        return;
      }
    }

    // If username is being changed, check if it's already taken
    if (username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername && existingUsername.id !== userId) {
        res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
        return;
      }
    }

    // Update user
    const updatedUser = await User.updateProfile(userId, {
      first_name,
      last_name,
      email,
      username
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during profile update'
    });
  }
};

// Get all users for discovery
const getAllUsers = async (
  _req: Request,
  res: Response<ApiResponse<UserDiscoveryResult[]>>
): Promise<void> => {
  try {
    const query = `
      SELECT id, username, email, first_name, last_name, profile_picture_url,
             (SELECT COUNT(*) FROM recipes WHERE user_id = users.id) as recipe_count,
             (SELECT COUNT(*) FROM followers WHERE followed_user_id = users.id) as followers_count
      FROM users
      ORDER BY recipe_count DESC, followers_count DESC
      LIMIT 50
    `;
    const result: QueryResult<UserDiscoveryResult> = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users'
    });
  }
};

export { register, login, updateProfile, getAllUsers };
