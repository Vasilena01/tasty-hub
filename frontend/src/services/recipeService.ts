import axiosInstance from './axiosConfig';
import { Recipe } from '../types/models.types';
import { PaginatedResponse, RecipeQueryParams, ApiResponse } from '../types/api.types';

interface RecipeFilters extends RecipeQueryParams {
  ingredients?: string;
}

const recipeService = {
  // Create recipe with image (FormData)
  createRecipe: async (formData: FormData): Promise<ApiResponse<Recipe>> => {
    // Note: Don't set Content-Type header - axios handles multipart/form-data automatically
    const response = await axiosInstance.post<ApiResponse<Recipe>>('/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get all recipes with filters
  getAllRecipes: async (filters: RecipeQueryParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<PaginatedResponse<Recipe>>(`/recipes?${params.toString()}`);
    return response.data;
  },

  // Get single recipe by ID
  getRecipeById: async (id: string | number): Promise<ApiResponse<Recipe>> => {
    const response = await axiosInstance.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    return response.data;
  },

  // Update recipe (FormData if new image, otherwise JSON)
  updateRecipe: async (id: string | number, formData: FormData): Promise<ApiResponse<Recipe>> => {
    const response = await axiosInstance.put<ApiResponse<Recipe>>(`/recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (id: string | number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/recipes/${id}`);
    return response.data;
  },

  // Get current user's recipes
  getMyRecipes: async (): Promise<ApiResponse<Recipe[]>> => {
    const response = await axiosInstance.get<ApiResponse<Recipe[]>>('/recipes/user/me');
    return response.data;
  },

  // Get recipes by user ID
  getRecipesByUserId: async (userId: number): Promise<ApiResponse<Recipe[]>> => {
    const response = await axiosInstance.get<ApiResponse<Recipe[]>>(`/recipes/user/${userId}`);
    return response.data;
  },

  // Search recipes by ingredients
  searchByIngredients: async (filters: RecipeFilters = {}): Promise<PaginatedResponse<Recipe>> => {
    const params = new URLSearchParams();
    if (filters.ingredients) params.append('ingredients', filters.ingredients);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<PaginatedResponse<Recipe>>(`/recipes/search/by-ingredients?${params.toString()}`);
    return response.data;
  },

  // Get recipes from followed users
  getFollowingRecipes: async (filters: RecipeQueryParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<PaginatedResponse<Recipe>>(`/recipes/following?${params.toString()}`);
    return response.data;
  }
};

export default recipeService;
