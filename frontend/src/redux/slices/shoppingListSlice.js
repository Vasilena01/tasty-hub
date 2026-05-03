import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shoppingListService from '../../services/shoppingListService';

// Initial State
const initialState = {
  items: [],                    // Array of shopping list items
  currentWeek: null,            // Currently viewed week (ISO date string)
  loading: false,
  generating: false,            // Separate loading state for generation
  error: null,
  successMessage: null,         // For user feedback
  addModalOpen: false           // UI state for add manual item modal
};

// Helper function to group items by category
const groupByCategory = (items) => {
  const grouped = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
  return grouped;
};

// Async Thunks
export const generateShoppingList = createAsyncThunk(
  'shoppingList/generate',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      const response = await shoppingListService.generateShoppingList(weekStartDate);
      return { weekStartDate, items: response.data.items, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate shopping list');
    }
  }
);

export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetch',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      const response = await shoppingListService.getShoppingListForWeek(weekStartDate);
      return { weekStartDate, items: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shopping list');
    }
  }
);

export const toggleItemChecked = createAsyncThunk(
  'shoppingList/toggleChecked',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await shoppingListService.toggleItemChecked(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'shoppingList/update',
  async ({ itemId, updates }, { rejectWithValue }) => {
    try {
      const response = await shoppingListService.updateShoppingListItem(itemId, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const addManualItem = createAsyncThunk(
  'shoppingList/addManual',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await shoppingListService.addManualItem(itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'shoppingList/delete',
  async (itemId, { rejectWithValue }) => {
    try {
      await shoppingListService.deleteItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

export const clearCheckedItems = createAsyncThunk(
  'shoppingList/clearChecked',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      await shoppingListService.clearCheckedItems(weekStartDate);
      return weekStartDate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear checked items');
    }
  }
);

export const deleteShoppingList = createAsyncThunk(
  'shoppingList/deleteAll',
  async (weekStartDate, { rejectWithValue }) => {
    try {
      await shoppingListService.deleteShoppingList(weekStartDate);
      return weekStartDate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete shopping list');
    }
  }
);

// Slice
const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    setCurrentWeek: (state, action) => {
      state.currentWeek = action.payload;
    },
    openAddModal: (state) => {
      state.addModalOpen = true;
    },
    closeAddModal: (state) => {
      state.addModalOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate shopping list
      .addCase(generateShoppingList.pending, (state) => {
        state.generating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(generateShoppingList.fulfilled, (state, action) => {
        state.generating = false;
        state.items = action.payload.items;
        state.currentWeek = action.payload.weekStartDate;
        state.successMessage = action.payload.message;
      })
      .addCase(generateShoppingList.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })
      // Fetch shopping list
      .addCase(fetchShoppingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.currentWeek = action.payload.weekStartDate;
      })
      .addCase(fetchShoppingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle item checked
      .addCase(toggleItemChecked.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleItemChecked.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = 'Item updated successfully';
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Add manual item
      .addCase(addManualItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.addModalOpen = false;
        state.successMessage = 'Item added successfully';
      })
      .addCase(addManualItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.successMessage = 'Item deleted successfully';
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clear checked items
      .addCase(clearCheckedItems.fulfilled, (state) => {
        state.items = state.items.filter(item => !item.is_checked);
        state.successMessage = 'Checked items cleared successfully';
      })
      .addCase(clearCheckedItems.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete shopping list
      .addCase(deleteShoppingList.fulfilled, (state) => {
        state.items = [];
        state.successMessage = 'Shopping list deleted successfully';
      })
      .addCase(deleteShoppingList.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentWeek,
  openAddModal,
  closeAddModal,
  clearError,
  clearSuccessMessage
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;

// Selectors
export const selectShoppingListItems = (state) => state.shoppingList.items;
export const selectShoppingListByCategory = (state) => groupByCategory(state.shoppingList.items);
export const selectCheckedCount = (state) => state.shoppingList.items.filter(item => item.is_checked).length;
export const selectTotalCount = (state) => state.shoppingList.items.length;
