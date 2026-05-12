import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Recipe } from '../../types/models.types';
import savedRecipesService from '../../services/savedRecipesService';

// State interface - store Recipe objects directly
interface SavedRecipesState {
  savedRecipes: Recipe[];
  savedRecipeIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: SavedRecipesState = {
  savedRecipes: [],
  savedRecipeIds: [],
  loading: false,
  error: null
};

// Fetch all saved recipes for the current user
export const fetchSavedRecipes = createAsyncThunk<
  Recipe[],
  void,
  { rejectValue: string }
>(
  'savedRecipes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await savedRecipesService.fetchSavedRecipes();
      // Backend returns { data: { recipes: Recipe[] } }
      return response.data?.recipes || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved recipes');
    }
  }
);

// Save a recipe
export const saveRecipe = createAsyncThunk<
  number, // Just return the recipe ID
  number,
  { rejectValue: string }
>(
  'savedRecipes/save',
  async (recipeId, { rejectWithValue }) => {
    try {
      await savedRecipesService.saveRecipe(recipeId);
      return recipeId; // Return the recipeId instead
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save recipe');
    }
  }
);

// Unsave a recipe
export const unsaveRecipe = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'savedRecipes/unsave',
  async (recipeId, { rejectWithValue }) => {
    try {
      await savedRecipesService.unsaveRecipe(recipeId);
      return recipeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unsave recipe');
    }
  }
);

// Check if a recipe is saved
export const checkIfSaved = createAsyncThunk<
  { recipeId: number; isSaved: boolean },
  number,
  { rejectValue: string }
>(
  'savedRecipes/check',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await savedRecipesService.checkIfSaved(recipeId);
      return { recipeId, isSaved: response.data?.isSaved || false }; // Backend returns data.isSaved
    } catch (error: any) {
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
        state.savedRecipeIds = action.payload.map(recipe => recipe.id);
      })
      .addCase(fetchSavedRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch saved recipes';
      })
      // Save recipe
      .addCase(saveRecipe.pending, (state) => {
        state.error = null;
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        const recipeId = action.payload;
        if (!state.savedRecipeIds.includes(recipeId)) {
          state.savedRecipeIds.push(recipeId);
        }
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to save recipe';
      })
      // Unsave recipe
      .addCase(unsaveRecipe.pending, (state) => {
        state.error = null;
      })
      .addCase(unsaveRecipe.fulfilled, (state, action) => {
        const recipeId = action.payload;
        state.savedRecipes = state.savedRecipes.filter(recipe => recipe.id !== recipeId);
        state.savedRecipeIds = state.savedRecipeIds.filter(id => id !== recipeId);
      })
      .addCase(unsaveRecipe.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to unsave recipe';
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
