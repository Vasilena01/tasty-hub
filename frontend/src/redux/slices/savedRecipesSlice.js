import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import savedRecipesService from '../../services/savedRecipesService';

const initialState = {
  savedRecipes: [],
  savedRecipeIds: [],
  loading: false,
  error: null
};

// Fetch all saved recipes for the current user
export const fetchSavedRecipes = createAsyncThunk(
  'savedRecipes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await savedRecipesService.fetchSavedRecipes();
      return response.data.recipes; // Backend returns data.recipes
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved recipes');
    }
  }
);

// Save a recipe
export const saveRecipe = createAsyncThunk(
  'savedRecipes/save',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await savedRecipesService.saveRecipe(recipeId);
      return response.data; // Backend returns data (the saved recipe object)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save recipe');
    }
  }
);

// Unsave a recipe
export const unsaveRecipe = createAsyncThunk(
  'savedRecipes/unsave',
  async (recipeId, { rejectWithValue }) => {
    try {
      await savedRecipesService.unsaveRecipe(recipeId);
      return recipeId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unsave recipe');
    }
  }
);

// Check if a recipe is saved
export const checkIfSaved = createAsyncThunk(
  'savedRecipes/check',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await savedRecipesService.checkIfSaved(recipeId);
      return { recipeId, isSaved: response.data.isSaved }; // Backend returns data.isSaved
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check saved status');
    }
  }
);

const savedRecipesSlice = createSlice({
  name: 'savedRecipes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSavedRecipes: (state) => {
      state.savedRecipes = [];
      state.savedRecipeIds = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch saved recipes
      .addCase(fetchSavedRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.savedRecipes = action.payload;
        state.savedRecipeIds = action.payload.map(sr => sr.recipe_id);
      })
      .addCase(fetchSavedRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save recipe
      .addCase(saveRecipe.pending, (state) => {
        state.error = null;
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        state.savedRecipes.push(action.payload);
        if (!state.savedRecipeIds.includes(action.payload.recipe_id)) {
          state.savedRecipeIds.push(action.payload.recipe_id);
        }
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Unsave recipe
      .addCase(unsaveRecipe.pending, (state) => {
        state.error = null;
      })
      .addCase(unsaveRecipe.fulfilled, (state, action) => {
        const recipeId = action.payload;
        state.savedRecipes = state.savedRecipes.filter(sr => sr.recipe_id !== recipeId);
        state.savedRecipeIds = state.savedRecipeIds.filter(id => id !== recipeId);
      })
      .addCase(unsaveRecipe.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Check if saved
      .addCase(checkIfSaved.fulfilled, (state, action) => {
        const { recipeId, isSaved } = action.payload;
        if (isSaved) {
          if (!state.savedRecipeIds.includes(recipeId)) {
            state.savedRecipeIds.push(recipeId);
          }
        } else {
          state.savedRecipeIds = state.savedRecipeIds.filter(id => id !== recipeId);
        }
      });
  }
});

export const { clearError, resetSavedRecipes } = savedRecipesSlice.actions;
export default savedRecipesSlice.reducer;
