import axiosInstance from './axiosConfig';
import { User } from '../types/models.types';
import { ApiResponse } from '../types/api.types';

const userService = {
  // Get user by ID
  getUserById: async (userId: number): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
