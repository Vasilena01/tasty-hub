// User model types
export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreateInput {
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
}

export interface IUserUpdateInput {
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  email?: string;
  username?: string;
}

// Recipe model types
export interface IRecipe {
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
  total_ratings?: number;
  total_saves?: number;
  created_at: Date;
  updated_at: Date;
}

export interface IRecipeCreateInput {
  user_id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  cooking_time: number;
  servings: number;
  image_url: string;
  instructions: string;
}

export interface IRecipeUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  cooking_time?: number;
  servings?: number;
  image_url?: string;
  instructions?: string;
}

// Rating model types
export interface IRating {
  id: number;
  user_id: number;
  recipe_id: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface IRatingCreateInput {
  user_id: number;
  recipe_id: number;
  rating: number;
}

// SavedRecipe model types
export interface ISavedRecipe {
  id: number;
  user_id: number;
  recipe_id: number;
  created_at: Date;
}

export interface ISavedRecipeCreateInput {
  user_id: number;
  recipe_id: number;
}

// MealPlan model types
export interface IMealPlan {
  id: number;
  user_id: number;
  recipe_id: number;
  week_start_date: Date;
  day_of_week: number;
  meal_type: string;
  created_at: Date;
}

export interface IMealPlanCreateInput {
  user_id: number;
  recipe_id: number;
  week_start_date: Date;
  day_of_week: number;
  meal_type: string;
}

// ShoppingList model types
export interface IShoppingList {
  id: number;
  user_id: number;
  week_start_date: Date;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: string;
  is_checked: boolean;
  created_at: Date;
}

export interface IShoppingListCreateInput {
  user_id: number;
  week_start_date: Date;
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface IShoppingListUpdateInput {
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  is_checked?: boolean;
}

// Follower model types
export interface IFollower {
  id: number;
  follower_user_id: number;
  followed_user_id: number;
  created_at: Date;
}

export interface IFollowerCreateInput {
  follower_user_id: number;
  followed_user_id: number;
}

// Notification model types
export interface INotification {
  id: number;
  user_id: number;
  sender_user_id: number;
  type: string;
  message: string;
  recipe_id?: number;
  is_read: boolean;
  created_at: Date;
}

export interface INotificationCreateInput {
  user_id: number;
  sender_user_id: number;
  type: string;
  message: string;
  recipe_id?: number;
}

export interface INotificationUpdateInput {
  is_read?: boolean;
}

// Ingredient model types
export interface IIngredient {
  id: number;
  name: string;
  created_at: Date;
}

export interface IIngredientCreateInput {
  name: string;
}

// RecipeIngredient model types
export interface IRecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
}

export interface IRecipeIngredientCreateInput {
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
}
