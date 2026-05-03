import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';
import savedRecipesReducer from './slices/savedRecipesSlice';
import mealPlanReducer from './slices/mealPlanSlice';
import shoppingListReducer from './slices/shoppingListSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    savedRecipes: savedRecipesReducer,
    mealPlan: mealPlanReducer,
    shoppingList: shoppingListReducer
  }
});

export default store;
