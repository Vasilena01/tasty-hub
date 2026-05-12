// User types (matching backend but without password_hash)
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Recipe types
export interface Recipe {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  cooking_time: number;
  servings: number;
  image_url: string;
  instructions: string;
  average_rating?: number;
  rating_count?: number;
  created_at?: Date;
  updated_at?: Date;
  ingredients?: RecipeIngredient[];
}

// Recipe ingredient
export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

// Rating types
export interface Rating {
  id: number;
  user_id: number;
  recipe_id: number;
  rating: number;
  created_at?: Date;
}

// Saved recipe
export interface SavedRecipe {
  id: number;
  user_id: number;
  recipe_id: number;
  recipe?: Recipe;
  created_at?: Date;
}

// Meal plan
export interface MealPlan {
  id: number;
  user_id: number;
  recipe_id: number;
  week_start_date: Date | string;
  day_of_week: number;
  meal_type: string;
  recipe?: Recipe;
  created_at?: Date;
}

// Shopping list
export interface ShoppingListItem {
  id: number;
  user_id: number;
  week_start_date: Date | string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: string;
  is_checked: boolean;
  created_at?: Date;
}

// Follower
export interface Follower {
  id: number;
  follower_id: number;
  following_id: number;
  created_at?: Date;
}

// Notification
export interface Notification {
  id: number;
  user_id: number;
  sender_id: number;
  type: string;
  message: string;
  recipe_id?: number;
  is_read: boolean;
  created_at?: Date;
}
