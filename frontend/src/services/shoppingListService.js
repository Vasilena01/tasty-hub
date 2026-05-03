import axiosInstance from './axiosConfig';

const shoppingListService = {
  // Generate shopping list from meal plan
  generateShoppingList: async (weekStartDate) => {
    const response = await axiosInstance.post(`/shopping-lists/generate/${weekStartDate}`);
    return response.data;
  },

  // Get shopping list for a specific week
  getShoppingListForWeek: async (weekStartDate) => {
    const response = await axiosInstance.get(`/shopping-lists/week/${weekStartDate}`);
    return response.data;
  },

  // Toggle item checked status
  toggleItemChecked: async (itemId) => {
    const response = await axiosInstance.put(`/shopping-lists/${itemId}/toggle`);
    return response.data;
  },

  // Update shopping list item
  updateShoppingListItem: async (itemId, updates) => {
    // updates: { ingredient_name, quantity, unit }
    const response = await axiosInstance.put(`/shopping-lists/${itemId}`, updates);
    return response.data;
  },

  // Add manual item
  addManualItem: async (itemData) => {
    // itemData: { ingredient_name, quantity, unit, week_start_date }
    const response = await axiosInstance.post('/shopping-lists', itemData);
    return response.data;
  },

  // Delete single item
  deleteItem: async (itemId) => {
    const response = await axiosInstance.delete(`/shopping-lists/${itemId}`);
    return response.data;
  },

  // Clear checked items
  clearCheckedItems: async (weekStartDate) => {
    const response = await axiosInstance.delete(`/shopping-lists/week/${weekStartDate}/checked`);
    return response.data;
  },

  // Delete entire list (for regeneration)
  deleteShoppingList: async (weekStartDate) => {
    const response = await axiosInstance.delete(`/shopping-lists/week/${weekStartDate}`);
    return response.data;
  }
};

export default shoppingListService;
