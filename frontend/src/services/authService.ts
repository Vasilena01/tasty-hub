import axiosInstance from './axiosConfig';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/api.types';

// Register new user
const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

// Login existing user
const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

const authService = {
  register,
  login
};

export default authService;
