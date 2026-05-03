import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mealPlanService from '../../services/mealPlanService';

// Initial State
const initialState = {
  mealPlans: [],              // Array of meal plan entries for current week
  currentWeek: null,          // Currently viewed week (ISO date string)
  loading: false,
  error: null,
  modalOpen: false,           // UI state for recipe selection modal
  selectedSlot: null          // { day_of_week, meal_type } for modal
};

// Async Thunks
export const fetchMealPlanForWeek = createAsyncThunk(
  'mealPlan/fetchForWeek',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.getMealPlanForWeek(weekStartDate);
      return { weekStartDate, mealPlans: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meal plan');
    }
  }
);

export const addRecipeToSlot = createAsyncThunk(
  'mealPlan/addRecipe',
  async (mealPlanData, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.addRecipeToSlot(mealPlanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add recipe');
    }
  }
);

export const updateMealPlan = createAsyncThunk(
  'mealPlan/update',
  async ({ id, recipeId }, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.updateMealPlanEntry(id, recipeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meal plan');
    }
  }
);

export const deleteMealPlan = createAsyncThunk(
  'mealPlan/delete',
  async (id, { rejectWithValue }) => {
    try {
      await mealPlanService.deleteMealPlanEntry(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meal plan');
    }
  }
);

// Slice
const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setCurrentWeek: (state, action) => {
      state.currentWeek = action.payload;
    },
    openRecipeModal: (state, action) => {
      state.modalOpen = true;
      state.selectedSlot = action.payload; // { day_of_week, meal_type }
    },
    closeRecipeModal: (state) => {
      state.modalOpen = false;
      state.selectedSlot = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch meal plan
      .addCase(fetchMealPlanForWeek.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealPlanForWeek.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = action.payload.mealPlans;
        state.currentWeek = action.payload.weekStartDate;
      })
      .addCase(fetchMealPlanForWeek.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add recipe
      .addCase(addRecipeToSlot.fulfilled, (state, action) => {
        state.mealPlans.push(action.payload);
        state.modalOpen = false;
        state.selectedSlot = null;
      })
      .addCase(addRecipeToSlot.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update meal plan
      .addCase(updateMealPlan.fulfilled, (state, action) => {
        const index = state.mealPlans.findIndex(mp => mp.id === action.payload.id);
        if (index !== -1) {
          state.mealPlans[index] = action.payload;
        }
      })
      // Delete meal plan
      .addCase(deleteMealPlan.fulfilled, (state, action) => {
        state.mealPlans = state.mealPlans.filter(mp => mp.id !== action.payload);
      });
  }
});

export const { setCurrentWeek, openRecipeModal, closeRecipeModal, clearError } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
