import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../../services/recipeService';

// Async Thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await recipeService.getAllRecipes(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipes');
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await recipeService.getRecipeById(id);
      return data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipe');
    }
  }
);

export const createRecipe = createAsyncThunk(
  'recipes/createRecipe',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await recipeService.createRecipe(formData);
      return data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create recipe');
    }
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await recipeService.updateRecipe(id, formData);
      return data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update recipe');
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue }) => {
    try {
      await recipeService.deleteRecipe(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete recipe');
    }
  }
);

export const fetchMyRecipes = createAsyncThunk(
  'recipes/fetchMyRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await recipeService.getMyRecipes();
      return data.recipes;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your recipes');
    }
  }
);

// Initial State
const initialState = {
  // Normalized entities
  entities: {},  // { [id]: recipe }

  // Browse page state
  browseList: [],  // Array of recipe IDs for browse page
  browsePagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },
  browseFilters: {
    category: '',
    difficulty: '',
    minRating: '',
    search: '',
    sortBy: 'newest'
  },

  // Detail page state
  currentRecipeId: null,

  // User's recipes
  myRecipeIds: [],

  // UI state
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false
};

// Slice
const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.browseFilters = { ...state.browseFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.browseFilters = {
        category: '',
        difficulty: '',
        minRating: '',
        search: '',
        sortBy: 'newest'
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    setCurrentRecipe: (state, action) => {
      state.currentRecipeId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipes (browse)
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize recipes into entities
        action.payload.recipes.forEach(recipe => {
          state.entities[recipe.id] = recipe;
        });
        // Store IDs in browse list
        state.browseList = action.payload.recipes.map(r => r.id);
        state.browsePagination = action.payload.pagination;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single recipe
      .addCase(fetchRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.loading = false;
        state.entities[action.payload.id] = action.payload;
        state.currentRecipeId = action.payload.id;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create recipe
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.entities[action.payload.id] = action.payload;
        state.myRecipeIds.unshift(action.payload.id);
        state.createSuccess = true;
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update recipe
      .addCase(updateRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.entities[action.payload.id] = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.loading = false;
        delete state.entities[action.payload];
        state.myRecipeIds = state.myRecipeIds.filter(id => id !== action.payload);
        state.browseList = state.browseList.filter(id => id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my recipes
      .addCase(fetchMyRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRecipes.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(recipe => {
          state.entities[recipe.id] = recipe;
        });
        state.myRecipeIds = action.payload.map(r => r.id);
      })
      .addCase(fetchMyRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { setFilters, clearFilters, clearError, clearSuccess, setCurrentRecipe } = recipeSlice.actions;

// Selectors
export const selectAllRecipes = (state) =>
  state.recipes.browseList.map(id => state.recipes.entities[id]).filter(Boolean);

export const selectRecipeById = (id) => (state) =>
  state.recipes.entities[id];

export const selectCurrentRecipe = (state) =>
  state.recipes.entities[state.recipes.currentRecipeId];

export const selectMyRecipes = (state) =>
  state.recipes.myRecipeIds.map(id => state.recipes.entities[id]).filter(Boolean);

export const selectRecipeLoading = (state) => state.recipes.loading;
export const selectRecipeError = (state) => state.recipes.error;
export const selectBrowseFilters = (state) => state.recipes.browseFilters;
export const selectBrowsePagination = (state) => state.recipes.browsePagination;

export default recipeSlice.reducer;
