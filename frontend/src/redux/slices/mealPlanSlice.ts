import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MealPlan } from '../../types/models.types';
import mealPlanService from '../../services/mealPlanService';

// State interface
interface MealPlanState {
  mealPlans: MealPlan[];
  currentWeek: string | null;
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
  selectedSlot: { day_of_week: number; meal_type: string } | null;
}

// Initial State
const initialState: MealPlanState = {
  mealPlans: [],              // Array of meal plan entries for current week
  currentWeek: null,          // Currently viewed week (ISO date string)
  loading: false,
  error: null,
  modalOpen: false,           // UI state for recipe selection modal
  selectedSlot: null          // { day_of_week, meal_type } for modal
};

// Async Thunks
export const fetchMealPlanForWeek = createAsyncThunk<
  { weekStartDate: string; mealPlans: MealPlan[] },
  string,
  { rejectValue: string }
>(
  'mealPlan/fetchForWeek',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.getMealPlanForWeek(weekStartDate);
      return { weekStartDate, mealPlans: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meal plan');
    }
  }
);

export const addRecipeToSlot = createAsyncThunk<
  MealPlan,
  { user_id: number; recipe_id: number; week_start_date: string; day_of_week: number; meal_type: string },
  { rejectValue: string }
>(
  'mealPlan/addRecipe',
  async (mealPlanData, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.addRecipeToSlot(mealPlanData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add recipe');
    }
  }
);

export const updateMealPlan = createAsyncThunk<
  MealPlan,
  { id: number; recipeId: number },
  { rejectValue: string }
>(
  'mealPlan/update',
  async ({ id, recipeId }, { rejectWithValue }) => {
    try {
      const response = await mealPlanService.updateMealPlanEntry(id, recipeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meal plan');
    }
  }
);

export const deleteMealPlan = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'mealPlan/delete',
  async (id, { rejectWithValue }) => {
    try {
      await mealPlanService.deleteMealPlanEntry(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meal plan');
    }
  }
);

// Slice
const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setCurrentWeek: (state, action: PayloadAction<string>) => {
      state.currentWeek = action.payload;
    },
    openRecipeModal: (state, action: PayloadAction<{ day_of_week: number; meal_type: string }>) => {
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
        state.error = action.payload || 'Failed to fetch meal plan';
      })
      // Add recipe
      .addCase(addRecipeToSlot.fulfilled, (state, action) => {
        state.mealPlans.push(action.payload);
        state.modalOpen = false;
        state.selectedSlot = null;
      })
      .addCase(addRecipeToSlot.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add recipe';
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
