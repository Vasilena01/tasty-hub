# Recipe Hub - Database Schema Documentation

## Overview
This document describes the complete PostgreSQL database schema for Recipe Hub application, including all tables, columns, data types, relationships, constraints, and indexes.

## Entity Relationship Diagram (Text)

```
Users (1) ──────< (M) Recipes
  │                     │
  │                     └──< (M) RecipeIngredients >──(M) Ingredients
  │                     │
  │                     └──< (M) Ratings
  │
  ├──< (M) SavedRecipes >──(M) Recipes
  │
  ├──< (M) MealPlans >──(M) Recipes
  │
  ├──< (M) ShoppingLists
  │
  ├──< (M) Followers (self-referencing)
  │
  └──< (M) Notifications
```

---

## Table Definitions

### 1. Users Table
Stores user account information for authentication and profile management.

**Table Name**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Unique username for login |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Unique email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | | User's first name |
| last_name | VARCHAR(100) | | User's last name |
| profile_picture_url | VARCHAR(500) | | URL to profile picture |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- `idx_users_username` on `username` - Fast username lookups for login
- `idx_users_email` on `email` - Fast email lookups for login

**Triggers**:
- `update_users_updated_at` - Automatically updates `updated_at` on row update

---

### 2. Recipes Table
Stores recipe content including title, instructions, metadata, and statistics.

**Table Name**: `recipes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique recipe identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | Recipe creator |
| title | VARCHAR(200) | NOT NULL | Recipe title |
| description | TEXT | | Brief recipe description |
| category | VARCHAR(50) | NOT NULL | Recipe category (dessert, main, etc.) |
| difficulty | VARCHAR(20) | NOT NULL, CHECK (easy/medium/hard) | Difficulty level |
| cooking_time | INTEGER | NOT NULL | Cooking time in minutes |
| servings | INTEGER | NOT NULL | Number of servings |
| image_url | VARCHAR(500) | | URL to recipe image |
| instructions | TEXT | NOT NULL | Step-by-step cooking instructions |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | Calculated average rating (0-5) |
| total_ratings | INTEGER | DEFAULT 0 | Total number of ratings |
| total_saves | INTEGER | DEFAULT 0 | Total number of saves |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Recipe creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- `idx_recipes_user_id` on `user_id` - Find recipes by creator
- `idx_recipes_category` on `category` - Filter by category
- `idx_recipes_difficulty` on `difficulty` - Filter by difficulty
- `idx_recipes_average_rating` on `average_rating` - Sort by rating
- `idx_recipes_created_at` on `created_at` - Sort by newest
- `idx_recipes_title` on `title` - Search by title

**Triggers**:
- `update_recipes_updated_at` - Automatically updates `updated_at` on row update

**Cascade Behavior**:
- When user is deleted, all their recipes are deleted
- When recipe is deleted, all related records cascade delete (ratings, saved_recipes, meal_plans, recipe_ingredients)

---

### 3. Ingredients Table
Master list of all ingredient names (normalized).

**Table Name**: `ingredients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique ingredient identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Ingredient name (lowercase) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes**:
- `idx_ingredients_name` on `name` - Fast ingredient search for autocomplete

---

### 4. RecipeIngredients Table
Junction table linking recipes to ingredients with quantities (many-to-many).

**Table Name**: `recipe_ingredients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| recipe_id | INTEGER | NOT NULL, FK → recipes(id) ON DELETE CASCADE | Recipe reference |
| ingredient_id | INTEGER | NOT NULL, FK → ingredients(id) ON DELETE CASCADE | Ingredient reference |
| quantity | VARCHAR(50) | NOT NULL | Ingredient quantity (e.g., "2", "1/2") |
| unit | VARCHAR(50) | | Unit of measurement (cups, tbsp, etc.) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes**:
- `idx_recipe_ingredients_recipe_id` on `recipe_id` - Get all ingredients for recipe
- `idx_recipe_ingredients_ingredient_id` on `ingredient_id` - Find recipes by ingredient
- `idx_recipe_ingredients_unique` on `(recipe_id, ingredient_id)` UNIQUE - Prevent duplicate ingredients per recipe

---

### 5. Ratings Table
Stores user ratings for recipes (1-5 stars).

**Table Name**: `ratings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique rating identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User who rated |
| recipe_id | INTEGER | NOT NULL, FK → recipes(id) ON DELETE CASCADE | Recipe being rated |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating value (1-5) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- `idx_ratings_user_recipe` on `(user_id, recipe_id)` UNIQUE - One rating per user per recipe
- `idx_ratings_recipe_id` on `recipe_id` - Get all ratings for recipe
- `idx_ratings_user_id` on `user_id` - Get all ratings by user

**Triggers**:
- `update_ratings_updated_at` - Automatically updates `updated_at` on row update

---

### 6. SavedRecipes Table
Tracks which users saved which recipes (favorites/bookmarks).

**Table Name**: `saved_recipes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User who saved |
| recipe_id | INTEGER | NOT NULL, FK → recipes(id) ON DELETE CASCADE | Recipe saved |
| saved_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Save timestamp |

**Indexes**:
- `idx_saved_recipes_user_recipe` on `(user_id, recipe_id)` UNIQUE - Prevent duplicate saves
- `idx_saved_recipes_user_id` on `user_id` - Get user's saved recipes
- `idx_saved_recipes_recipe_id` on `recipe_id` - Count recipe saves
- `idx_saved_recipes_saved_at` on `saved_at` - Sort by recently saved

---

### 7. MealPlans Table
Stores weekly meal calendar entries (breakfast/lunch/dinner for each day).

**Table Name**: `meal_plans`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User who created meal plan |
| recipe_id | INTEGER | NOT NULL, FK → recipes(id) ON DELETE CASCADE | Recipe assigned to slot |
| week_start_date | DATE | NOT NULL | Start date of week (Monday) |
| day_of_week | INTEGER | NOT NULL, CHECK (0-6) | Day of week (0=Sunday, 6=Saturday) |
| meal_type | VARCHAR(20) | NOT NULL, CHECK (breakfast/lunch/dinner) | Meal type |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes**:
- `idx_meal_plans_user_id` on `user_id` - Get user's meal plans
- `idx_meal_plans_recipe_id` on `recipe_id` - Find where recipe is used
- `idx_meal_plans_week_start_date` on `week_start_date` - Get meal plan for week
- `idx_meal_plans_unique_slot` on `(user_id, week_start_date, day_of_week, meal_type)` UNIQUE - One recipe per meal slot

---

### 8. ShoppingLists Table
Stores generated shopping list items from meal plans.

**Table Name**: `shopping_lists`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User who owns list |
| week_start_date | DATE | NOT NULL | Week this list is for |
| ingredient_name | VARCHAR(100) | NOT NULL | Ingredient name |
| quantity | VARCHAR(50) | NOT NULL | Aggregated quantity |
| unit | VARCHAR(50) | | Unit of measurement |
| category | VARCHAR(50) | | Ingredient category (Vegetables, Proteins, etc.) |
| is_checked | BOOLEAN | DEFAULT FALSE | Whether item is checked off |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- `idx_shopping_lists_user_id` on `user_id` - Get user's shopping lists
- `idx_shopping_lists_week_start_date` on `week_start_date` - Get list for week
- `idx_shopping_lists_category` on `category` - Group by category

**Triggers**:
- `update_shopping_lists_updated_at` - Automatically updates `updated_at` on row update

---

### 9. Followers Table
Tracks user following relationships (social feature).

**Table Name**: `followers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| follower_user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User who follows |
| followed_user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | User being followed |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Follow timestamp |

**Indexes**:
- `idx_followers_unique` on `(follower_user_id, followed_user_id)` UNIQUE - Prevent duplicate follows
- `idx_followers_follower_user_id` on `follower_user_id` - Get who user is following
- `idx_followers_followed_user_id` on `followed_user_id` - Get user's followers

**Constraints**:
- CHECK constraint: `follower_user_id != followed_user_id` - Prevent self-following

---

### 10. Notifications Table
Stores user notifications for recipe publishing events.

**Table Name**: `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE | Recipient user |
| sender_user_id | INTEGER | FK → users(id) ON DELETE CASCADE | User who triggered notification |
| type | VARCHAR(50) | NOT NULL | Notification type (new_recipe, etc.) |
| recipe_id | INTEGER | FK → recipes(id) ON DELETE CASCADE | Related recipe (if applicable) |
| message | TEXT | NOT NULL | Notification message |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes**:
- `idx_notifications_user_id` on `user_id` - Get user's notifications
- `idx_notifications_is_read` on `is_read` - Filter by read status
- `idx_notifications_created_at` on `created_at` - Sort by newest
- `idx_notifications_user_unread` on `(user_id, is_read) WHERE is_read = FALSE` - Partial index for unread notifications

---

## Relationships Summary

### One-to-Many Relationships
- `users` → `recipes` (one user creates many recipes)
- `users` → `ratings` (one user gives many ratings)
- `users` → `saved_recipes` (one user saves many recipes)
- `users` → `meal_plans` (one user has many meal plan entries)
- `users` → `shopping_lists` (one user has many shopping list items)
- `users` → `notifications` (one user receives many notifications)
- `recipes` → `recipe_ingredients` (one recipe has many ingredients)
- `recipes` → `ratings` (one recipe receives many ratings)

### Many-to-Many Relationships
- `recipes` ←→ `ingredients` (through `recipe_ingredients` junction table)
- `users` ←→ `recipes` (through `saved_recipes` - users save recipes)
- `users` ←→ `users` (through `followers` - users follow users)

---

## Cascade Delete Behavior

### When User is Deleted:
- ✅ All recipes created by user
- ✅ All ratings given by user
- ✅ All saved recipes by user
- ✅ All meal plans by user
- ✅ All shopping lists by user
- ✅ All follower relationships (as follower or followed)
- ✅ All notifications (as recipient or sender)

### When Recipe is Deleted:
- ✅ All recipe ingredients
- ✅ All ratings for recipe
- ✅ All saved recipe entries
- ✅ All meal plan entries using recipe
- ✅ All notifications referencing recipe

---

## Performance Optimization Strategy

### Indexes for Common Queries

1. **Recipe Browsing**:
   - Category filter: `idx_recipes_category`
   - Difficulty filter: `idx_recipes_difficulty`
   - Rating sort: `idx_recipes_average_rating`
   - Newest sort: `idx_recipes_created_at`
   - Title search: `idx_recipes_title`

2. **User Authentication**:
   - Login by email: `idx_users_email`
   - Login by username: `idx_users_username`

3. **Ingredient Search**:
   - Autocomplete: `idx_ingredients_name`
   - Find recipes by ingredient: `idx_recipe_ingredients_ingredient_id`

4. **Meal Planning**:
   - Get week's meals: `idx_meal_plans_week_start_date`
   - Prevent duplicate slots: `idx_meal_plans_unique_slot`

5. **Notifications**:
   - Get unread count: `idx_notifications_user_unread` (partial index)
   - Get recent notifications: `idx_notifications_created_at`

---

## Data Integrity Constraints

### Unique Constraints
- Users: username, email
- Ingredients: name
- Ratings: (user_id, recipe_id) - one rating per user per recipe
- SavedRecipes: (user_id, recipe_id) - can't save recipe twice
- MealPlans: (user_id, week_start_date, day_of_week, meal_type) - one recipe per slot
- Followers: (follower_user_id, followed_user_id) - can't follow same user twice

### Check Constraints
- Ratings: rating >= 1 AND rating <= 5
- Recipes: difficulty IN ('easy', 'medium', 'hard')
- MealPlans: day_of_week >= 0 AND day_of_week <= 6
- MealPlans: meal_type IN ('breakfast', 'lunch', 'dinner')
- Followers: follower_user_id != followed_user_id (no self-following)

### Foreign Key Constraints
- All foreign keys have ON DELETE CASCADE for automatic cleanup
- Maintains referential integrity across all relationships

---

## Schema Version
**Version**: 1.0  
**Created**: 2026-04-08  
**Last Updated**: 2026-04-08

---

## Migration Strategy
All tables are created via numbered SQL migration scripts in `backend/src/migrations/`:
- `001_create_users_table.sql`
- `002_create_recipes_table.sql`
- `003_create_ingredients_tables.sql`
- `004_create_ratings_table.sql`
- `005_create_saved_recipes_table.sql`
- `006_create_meal_plans_table.sql`
- `007_create_shopping_lists_table.sql`
- `008_create_followers_table.sql`
- `009_create_notifications_table.sql`

Migrations can be run via: `npm run migrate` in backend directory.
