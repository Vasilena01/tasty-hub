-- Create Ratings table
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure one rating per user per recipe
CREATE UNIQUE INDEX idx_ratings_user_recipe ON ratings(user_id, recipe_id);

-- Create indexes for queries
CREATE INDEX idx_ratings_recipe_id ON ratings(recipe_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
