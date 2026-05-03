import axiosInstance from './axiosConfig';

const mealPlanService = {
  // Get meal plan for a specific week
  getMealPlanForWeek: async (weekStartDate) => {
    const response = await axiosInstance.get(`/meal-plans/week/${weekStartDate}`);
    return response.data;
  },

  // Add recipe to meal slot
  addRecipeToSlot: async (mealPlanData) => {
    // mealPlanData: { recipe_id, week_start_date, day_of_week, meal_type }
    const response = await axiosInstance.post('/meal-plans', mealPlanData);
    return response.data;
  },

  // Update existing meal plan entry
  updateMealPlanEntry: async (id, recipeId) => {
    const response = await axiosInstance.put(`/meal-plans/${id}`, { recipe_id: recipeId });
    return response.data;
  },

  // Delete meal plan entry
  deleteMealPlanEntry: async (id) => {
    const response = await axiosInstance.delete(`/meal-plans/${id}`);
    return response.data;
  }
};

export default mealPlanService;
