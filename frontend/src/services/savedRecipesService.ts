import axiosInstance from './axiosConfig';
import { Recipe } from '../types/models.types';
import { ApiResponse } from '../types/api.types';

// Fetch all saved recipes for the authenticated user
const fetchSavedRecipes = async (): Promise<ApiResponse<Recipe[]>> => {
  const response = await axiosInstance.get<ApiResponse<Recipe[]>>('/saved-recipes');
  return response.data;
};

// Save a recipe
const saveRecipe = async (recipeId: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.post<ApiResponse<void>>(`/saved-recipes/${recipeId}`);
  return response.data;
};

// Unsave a recipe
const unsaveRecipe = async (recipeId: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete<ApiResponse<void>>(`/saved-recipes/${recipeId}`);
  return response.data;
};

// Check if a recipe is saved
const checkIfSaved = async (recipeId: number): Promise<ApiResponse<{ isSaved: boolean }>> => {
  const response = await axiosInstance.get<ApiResponse<{ isSaved: boolean }>>(`/saved-recipes/check/${recipeId}`);
  return response.data;
};

const savedRecipesService = {
  fetchSavedRecipes,
  saveRecipe,
  unsaveRecipe,
  checkIfSaved
};

export default savedRecipesService;
