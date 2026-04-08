-- Create ShoppingLists table
CREATE TABLE shopping_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  ingredient_name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(50),
  category VARCHAR(50),
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_week_start_date ON shopping_lists(week_start_date);
CREATE INDEX idx_shopping_lists_category ON shopping_lists(category);

-- Create updated_at trigger
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON shopping_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
