import axiosInstance from './axiosConfig';
import { ShoppingListItem } from '../types/models.types';
import { ApiResponse } from '../types/api.types';

interface ShoppingListItemUpdate {
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
}

interface ManualItemData {
  ingredient_name: string;
  quantity: string | number;
  unit: string;
  week_start_date: Date | string;
}

const shoppingListService = {
  // Generate shopping list from meal plan
  generateShoppingList: async (weekStartDate: string | Date): Promise<ApiResponse<ShoppingListItem[]>> => {
    const response = await axiosInstance.post<ApiResponse<ShoppingListItem[]>>(`/shopping-lists/generate/${weekStartDate}`);
    return response.data;
  },

  // Get shopping list for a specific week
  getShoppingListForWeek: async (weekStartDate: string | Date): Promise<ApiResponse<ShoppingListItem[]>> => {
    const response = await axiosInstance.get<ApiResponse<ShoppingListItem[]>>(`/shopping-lists/week/${weekStartDate}`);
    return response.data;
  },

  // Toggle item checked status
  toggleItemChecked: async (itemId: number): Promise<ApiResponse<ShoppingListItem>> => {
    const response = await axiosInstance.put<ApiResponse<ShoppingListItem>>(`/shopping-lists/${itemId}/toggle`);
    return response.data;
  },

  // Update shopping list item
  updateShoppingListItem: async (itemId: number, updates: ShoppingListItemUpdate): Promise<ApiResponse<ShoppingListItem>> => {
    // updates: { ingredient_name, quantity, unit }
    const response = await axiosInstance.put<ApiResponse<ShoppingListItem>>(`/shopping-lists/${itemId}`, updates);
    return response.data;
  },

  // Add manual item
  addManualItem: async (itemData: ManualItemData): Promise<ApiResponse<ShoppingListItem>> => {
    // itemData: { ingredient_name, quantity, unit, week_start_date }
    const response = await axiosInstance.post<ApiResponse<ShoppingListItem>>('/shopping-lists', itemData);
    return response.data;
  },

  // Delete single item
  deleteItem: async (itemId: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/shopping-lists/${itemId}`);
    return response.data;
  },

  // Clear checked items
  clearCheckedItems: async (weekStartDate: string | Date): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/shopping-lists/week/${weekStartDate}/checked`);
    return response.data;
  },

  // Delete entire list (for regeneration)
  deleteShoppingList: async (weekStartDate: string | Date): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/shopping-lists/week/${weekStartDate}`);
    return response.data;
  }
};

export default shoppingListService;
