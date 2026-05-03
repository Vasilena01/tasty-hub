import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';
import savedRecipesReducer from './slices/savedRecipesSlice';
import mealPlanReducer from './slices/mealPlanSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    savedRecipes: savedRecipesReducer,
    mealPlan: mealPlanReducer
  }
});

export default store;
