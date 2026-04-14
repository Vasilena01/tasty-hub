import axiosInstance from './axiosConfig';

const recipeService = {
  // Create recipe with image (FormData)
  createRecipe: async (formData) => {
    // Note: Don't set Content-Type header - axios handles multipart/form-data automatically
    const response = await axiosInstance.post('/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get all recipes with filters
  getAllRecipes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axiosInstance.get(`/recipes?${params.toString()}`);
    return response.data;
  },

  // Get single recipe by ID
  getRecipeById: async (id) => {
    const response = await axiosInstance.get(`/recipes/${id}`);
    return response.data;
  },

  // Update recipe (FormData if new image, otherwise JSON)
  updateRecipe: async (id, formData) => {
    const response = await axiosInstance.put(`/recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    const response = await axiosInstance.delete(`/recipes/${id}`);
    return response.data;
  },

  // Get current user's recipes
  getMyRecipes: async () => {
    const response = await axiosInstance.get('/recipes/user/me');
    return response.data;
  }
};

export default recipeService;
