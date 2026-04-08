-- Create MealPlans table
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_recipe_id ON meal_plans(recipe_id);
CREATE INDEX idx_meal_plans_week_start_date ON meal_plans(week_start_date);

-- Prevent duplicate meal entries for same slot
CREATE UNIQUE INDEX idx_meal_plans_unique_slot ON meal_plans(user_id, week_start_date, day_of_week, meal_type);
