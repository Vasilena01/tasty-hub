import axiosInstance from './axiosConfig';
import { MealPlan } from '../types/models.types';
import { ApiResponse } from '../types/api.types';

interface MealPlanData {
  recipe_id: number;
  week_start_date: Date | string;
  day_of_week: number;
  meal_type: string;
}

const mealPlanService = {
  // Get meal plan for a specific week
  getMealPlanForWeek: async (weekStartDate: string | Date): Promise<ApiResponse<MealPlan[]>> => {
    const response = await axiosInstance.get<ApiResponse<MealPlan[]>>(`/meal-plans/week/${weekStartDate}`);
    return response.data;
  },

  // Add recipe to meal slot
  addRecipeToSlot: async (mealPlanData: MealPlanData): Promise<ApiResponse<MealPlan>> => {
    // mealPlanData: { recipe_id, week_start_date, day_of_week, meal_type }
    const response = await axiosInstance.post<ApiResponse<MealPlan>>('/meal-plans', mealPlanData);
    return response.data;
  },

  // Update existing meal plan entry
  updateMealPlanEntry: async (id: number, recipeId: number): Promise<ApiResponse<MealPlan>> => {
    const response = await axiosInstance.put<ApiResponse<MealPlan>>(`/meal-plans/${id}`, { recipe_id: recipeId });
    return response.data;
  },

  // Delete meal plan entry
  deleteMealPlanEntry: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/meal-plans/${id}`);
    return response.data;
  }
};

export default mealPlanService;
