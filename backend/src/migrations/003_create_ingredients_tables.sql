-- Create Ingredients master table
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ingredient search
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- Create RecipeIngredients junction table
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Ensure no duplicate ingredients per recipe
CREATE UNIQUE INDEX idx_recipe_ingredients_unique ON recipe_ingredients(recipe_id, ingredient_id);
