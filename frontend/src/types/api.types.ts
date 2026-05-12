// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  token?: string;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}

// Recipe filter/search query types
export interface RecipeQueryParams {
  category?: string;
  difficulty?: string;
  minRating?: number;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// Ingredient search types
export interface IngredientSearchParams {
  query: string;
}

// Import User type from models
import { User } from './models.types';
