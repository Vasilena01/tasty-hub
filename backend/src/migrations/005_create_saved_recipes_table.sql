-- Create SavedRecipes table
CREATE TABLE saved_recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure user can't save same recipe twice
CREATE UNIQUE INDEX idx_saved_recipes_user_recipe ON saved_recipes(user_id, recipe_id);

-- Create indexes
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX idx_saved_recipes_saved_at ON saved_recipes(saved_at);
