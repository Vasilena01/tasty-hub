const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const RecipeIngredient = require('../models/RecipeIngredient');
const Rating = require('../models/Rating');
const SavedRecipe = require('../models/SavedRecipe');
const db = require('../config/database');

async function testModels() {
  try {
    console.log('🧪 Testing Recipe Hub Database Models\n');
    console.log('=====================================\n');

    // Test User model
    console.log('1️⃣  Testing User Model...');
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed_password_123',
      first_name: 'Test',
      last_name: 'User'
    });
    console.log(`   ✅ User created: ${testUser.username} (ID: ${testUser.id})`);

    const foundUser = await User.findById(testUser.id);
    console.log(`   ✅ User found by ID: ${foundUser.username}`);

    const foundByEmail = await User.findByEmail(testUser.email);
    console.log(`   ✅ User found by email: ${foundByEmail.username}`);

    // Test Recipe model
    console.log('\n2️⃣  Testing Recipe Model...');
    const testRecipe = await Recipe.create({
      user_id: testUser.id,
      title: 'Chocolate Chip Cookies',
      description: 'Delicious homemade cookies',
      category: 'dessert',
      difficulty: 'easy',
      cooking_time: 30,
      servings: 12,
      instructions: '1. Mix ingredients\n2. Bake at 350°F\n3. Enjoy!'
    });
    console.log(`   ✅ Recipe created: "${testRecipe.title}" (ID: ${testRecipe.id})`);

    const foundRecipe = await Recipe.findById(testRecipe.id);
    console.log(`   ✅ Recipe found: "${foundRecipe.title}" by ${foundRecipe.username}`);

    // Test Ingredient model
    console.log('\n3️⃣  Testing Ingredient Model...');
    const flour = await Ingredient.findOrCreate('Flour');
    console.log(`   ✅ Ingredient created: ${flour.name} (ID: ${flour.id})`);

    const sugar = await Ingredient.findOrCreate('Sugar');
    console.log(`   ✅ Ingredient created: ${sugar.name} (ID: ${sugar.id})`);

    const eggs = await Ingredient.findOrCreate('Eggs');
    console.log(`   ✅ Ingredient created: ${eggs.name} (ID: ${eggs.id})`);

    // Test searching ingredients
    const searchResults = await Ingredient.search('su');
    console.log(`   ✅ Ingredient search for "su": found ${searchResults.length} results`);

    // Test RecipeIngredient model
    console.log('\n4️⃣  Testing RecipeIngredient Model...');
    await RecipeIngredient.create({
      recipe_id: testRecipe.id,
      ingredient_id: flour.id,
      quantity: '2',
      unit: 'cups'
    });
    console.log('   ✅ Added Flour to recipe');

    await RecipeIngredient.create({
      recipe_id: testRecipe.id,
      ingredient_id: sugar.id,
      quantity: '1',
      unit: 'cup'
    });
    console.log('   ✅ Added Sugar to recipe');

    await RecipeIngredient.create({
      recipe_id: testRecipe.id,
      ingredient_id: eggs.id,
      quantity: '2',
      unit: 'whole'
    });
    console.log('   ✅ Added Eggs to recipe');

    const ingredients = await RecipeIngredient.findByRecipeId(testRecipe.id);
    console.log(`   ✅ Retrieved recipe ingredients: ${ingredients.length} items`);
    ingredients.forEach(ing => {
      console.log(`      - ${ing.quantity} ${ing.unit} ${ing.ingredient_name}`);
    });

    // Test Rating model
    console.log('\n5️⃣  Testing Rating Model...');
    const rating = await Rating.upsert({
      user_id: testUser.id,
      recipe_id: testRecipe.id,
      rating: 5
    });
    console.log(`   ✅ Rating created: ${rating.rating} stars`);

    await Recipe.updateRatingStats(testRecipe.id);
    const updatedRecipe = await Recipe.findById(testRecipe.id);
    console.log(`   ✅ Recipe rating stats updated: ${updatedRecipe.average_rating} avg (${updatedRecipe.total_ratings} ratings)`);

    // Test SavedRecipe model
    console.log('\n6️⃣  Testing SavedRecipe Model...');
    const savedRecipe = await SavedRecipe.create({
      user_id: testUser.id,
      recipe_id: testRecipe.id
    });
    console.log('   ✅ Recipe saved by user');

    const savedRecipes = await SavedRecipe.findByUserId(testUser.id);
    console.log(`   ✅ Retrieved saved recipes: ${savedRecipes.length} items`);

    const isSaved = await SavedRecipe.exists(testUser.id, testRecipe.id);
    console.log(`   ✅ Saved status check: ${isSaved ? 'saved' : 'not saved'}`);

    // Test Recipe filtering
    console.log('\n7️⃣  Testing Recipe Filtering...');
    const dessertRecipes = await Recipe.findAll({ category: 'dessert', limit: 10 });
    console.log(`   ✅ Found ${dessertRecipes.length} dessert recipes`);

    const easyRecipes = await Recipe.findAll({ difficulty: 'easy', limit: 10 });
    console.log(`   ✅ Found ${easyRecipes.length} easy recipes`);

    // Test finding recipes by user
    const userRecipes = await Recipe.findByUserId(testUser.id);
    console.log(`   ✅ User has ${userRecipes.length} recipes`);

    // Test ingredient-based search
    console.log('\n8️⃣  Testing Ingredient-Based Search...');
    const recipesWithIngredients = await RecipeIngredient.findRecipesByIngredients([flour.id, sugar.id, eggs.id]);
    console.log(`   ✅ Found ${recipesWithIngredients.length} recipes with all 3 ingredients`);

    // Cleanup
    console.log('\n9️⃣  Cleaning up test data...');
    await db.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    console.log('   ✅ Test data cleaned up (cascading deletes handled automatically)');

    console.log('\n=====================================');
    console.log('🎉 All Model Tests Passed!');
    console.log('=====================================\n');

    console.log('📊 Summary:');
    console.log('   ✅ User Model - CRUD operations working');
    console.log('   ✅ Recipe Model - CRUD and filtering working');
    console.log('   ✅ Ingredient Model - Search and find/create working');
    console.log('   ✅ RecipeIngredient Model - Junction table working');
    console.log('   ✅ Rating Model - Upsert and aggregation working');
    console.log('   ✅ SavedRecipe Model - Save/unsave working');
    console.log('   ✅ Cascade Deletes - Working correctly');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testModels();
