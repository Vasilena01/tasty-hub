import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../../types/models.types';
import { PaginatedResponse, RecipeQueryParams } from '../../types/api.types';
import recipeService from '../../services/recipeService';

// State interface
interface RecipeState {
  entities: { [id: number]: Recipe };
  browseList: number[];
  browsePagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  browseFilters: RecipeQueryParams & {
    ingredientSearch: string;
    source: string;
  };
  currentRecipeId: number | null;
  myRecipeIds: number[];
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

// Async Thunks
export const fetchRecipes = createAsyncThunk<
  PaginatedResponse<Recipe>,
  RecipeQueryParams,
  { rejectValue: string }
>(
  'recipes/fetchRecipes',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await recipeService.getAllRecipes(filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipes');
    }
  }
);

export const fetchRecipeById = createAsyncThunk<
  Recipe,
  number,
  { rejectValue: string }
>(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await recipeService.getRecipeById(id);
      return data.recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipe');
    }
  }
);

export const createRecipe = createAsyncThunk<
  Recipe,
  FormData,
  { rejectValue: string }
>(
  'recipes/createRecipe',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await recipeService.createRecipe(formData);
      return data.recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create recipe');
    }
  }
);

export const updateRecipe = createAsyncThunk<
  Recipe,
  { id: number; formData: FormData },
  { rejectValue: string }
>(
  'recipes/updateRecipe',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await recipeService.updateRecipe(id, formData);
      return data.recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update recipe');
    }
  }
);

export const deleteRecipe = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue }) => {
    try {
      await recipeService.deleteRecipe(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete recipe');
    }
  }
);

export const fetchMyRecipes = createAsyncThunk<
  Recipe[],
  void,
  { rejectValue: string }
>(
  'recipes/fetchMyRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await recipeService.getMyRecipes();
      return data.recipes || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your recipes');
    }
  }
);

export const searchRecipesByIngredients = createAsyncThunk<
  PaginatedResponse<Recipe>,
  RecipeQueryParams,
  { rejectValue: string }
>(
  'recipes/searchByIngredients',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await recipeService.searchByIngredients(filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search recipes by ingredients');
    }
  }
);

export const fetchFollowingRecipes = createAsyncThunk<
  PaginatedResponse<Recipe>,
  RecipeQueryParams,
  { rejectValue: string }
>(
  'recipes/fetchFollowingRecipes',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await recipeService.getFollowingRecipes(filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch following recipes');
    }
  }
);

// Initial State
const initialState: RecipeState = {
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
    minRating: undefined,
    search: '',
    ingredientSearch: '',
    sortBy: 'newest',
    source: 'all'
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
    setFilters: (state, action: PayloadAction<Partial<RecipeState['browseFilters']>>) => {
      state.browseFilters = { ...state.browseFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.browseFilters = {
        category: '',
        difficulty: '',
        minRating: undefined,
        search: '',
        ingredientSearch: '',
        sortBy: 'newest',
        source: 'all'
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
    setCurrentRecipe: (state, action: PayloadAction<number>) => {
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
        state.error = action.payload as string || 'Failed to fetch recipes';
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
        state.error = action.payload as string || null;
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
        state.error = action.payload as string || null;
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
        state.error = action.payload as string || null;
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
        state.error = action.payload as string || null;
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
        state.error = action.payload as string || null;
      })

      // Search by ingredients
      .addCase(searchRecipesByIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRecipesByIngredients.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize recipes into entities
        action.payload.recipes.forEach(recipe => {
          state.entities[recipe.id] = recipe;
        });
        // Store IDs in browse list
        state.browseList = action.payload.recipes.map(r => r.id);
        state.browsePagination = action.payload.pagination;
      })
      .addCase(searchRecipesByIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || null;
      })

      // Fetch following recipes
      .addCase(fetchFollowingRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowingRecipes.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize recipes into entities
        action.payload.recipes.forEach(recipe => {
          state.entities[recipe.id] = recipe;
        });
        // Store IDs in browse list
        state.browseList = action.payload.recipes.map(r => r.id);
        state.browsePagination = action.payload.pagination;
      })
      .addCase(fetchFollowingRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || null;
      });
  }
});

// Export actions
export const { setFilters, clearFilters, clearError, clearSuccess, setCurrentRecipe } = recipeSlice.actions;

// Selectors
export const selectAllRecipes = (state: any) =>
  state.recipes.browseList.map((id: number) => state.recipes.entities[id]).filter(Boolean);

export const selectRecipeById = (id: number) => (state: any) =>
  state.recipes.entities[id];

export const selectCurrentRecipe = (state: any) =>
  state.recipes.entities[state.recipes.currentRecipeId];

export const selectMyRecipes = (state: any) =>
  state.recipes.myRecipeIds.map((id: number) => state.recipes.entities[id]).filter(Boolean);

export const selectRecipeLoading = (state: any) => state.recipes.loading;
export const selectRecipeError = (state: any) => state.recipes.error;
export const selectBrowseFilters = (state: any) => state.recipes.browseFilters;
export const selectBrowsePagination = (state: any) => state.recipes.browsePagination;

export default recipeSlice.reducer;
