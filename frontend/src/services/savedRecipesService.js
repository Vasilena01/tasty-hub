import axiosInstance from './axiosConfig';

// Fetch all saved recipes for the authenticated user
const fetchSavedRecipes = async () => {
  const response = await axiosInstance.get('/saved-recipes');
  return response.data;
};

// Save a recipe
const saveRecipe = async (recipeId) => {
  const response = await axiosInstance.post('/saved-recipes', { recipe_id: recipeId });
  return response.data;
};

// Unsave a recipe
const unsaveRecipe = async (recipeId) => {
  const response = await axiosInstance.delete(`/saved-recipes/${recipeId}`);
  return response.data;
};

// Check if a recipe is saved
const checkIfSaved = async (recipeId) => {
  const response = await axiosInstance.get(`/saved-recipes/check/${recipeId}`);
  return response.data;
};

const savedRecipesService = {
  fetchSavedRecipes,
  saveRecipe,
  unsaveRecipe,
  checkIfSaved
};

export default savedRecipesService;
