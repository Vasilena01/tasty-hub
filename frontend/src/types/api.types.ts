// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  token?: string;
  // Direct field access (some endpoints return data directly)
  user?: any;
  recipe?: any;
  recipes?: any[];
  counts?: any;
  followers?: any[];
  following?: any[];
  items?: any[];
}

// Paginated response for recipes
export interface PaginatedResponse<T> {
  success: boolean;
  recipes: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
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
  ingredients?: string;
}

// Ingredient search types
export interface IngredientSearchParams {
  query: string;
}

// Import User type from models
import { User } from './models.types';
