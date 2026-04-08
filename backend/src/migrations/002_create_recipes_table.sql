-- Create Recipes table
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cooking_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  image_url VARCHAR(500),
  instructions TEXT NOT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_average_rating ON recipes(average_rating);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_title ON recipes(title);

-- Create updated_at trigger
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
