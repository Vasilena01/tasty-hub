import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';
import savedRecipesReducer from './slices/savedRecipesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    savedRecipes: savedRecipesReducer
  }
});

export default store;
