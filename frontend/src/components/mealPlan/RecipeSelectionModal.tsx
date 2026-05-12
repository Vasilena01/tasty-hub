import React, { useState, useEffect, MouseEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { closeRecipeModal, addRecipeToSlot, updateMealPlan } from '../../redux/slices/mealPlanSlice';
import { fetchMyRecipes } from '../../redux/slices/recipeSlice';
import { fetchSavedRecipes } from '../../redux/slices/savedRecipesSlice';
import { Recipe } from '../../types/models.types';
import './RecipeSelectionModal.css';

interface SelectedSlot {
  day_of_week: number;
  meal_type: string;
}

interface RecipeSelectionModalProps {
  isOpen: boolean;
  selectedSlot: SelectedSlot | null;
  currentWeek: Date | string;
}

const RecipeSelectionModal: React.FC<RecipeSelectionModalProps> = ({
  isOpen,
  selectedSlot,
  currentWeek
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'my-recipes' | 'saved-recipes'>('my-recipes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const myRecipes = useAppSelector(state =>
    state.recipes.myRecipeIds?.map(id => state.recipes.entities[id]).filter((r): r is Recipe => !!r) || []
  );
  const savedRecipes = useAppSelector(state =>
    (state.savedRecipes.savedRecipes || []).map(sr => sr.recipe).filter((r): r is Recipe => !!r)
  );
  const mealPlans = useAppSelector(state => state.mealPlan.mealPlans);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMyRecipes());
      dispatch(fetchSavedRecipes());
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !selectedSlot) return null;

  // Get recipes based on active tab
  const recipes = activeTab === 'my-recipes' ? myRecipes : savedRecipes;

  // Filter by search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if slot already has a meal plan entry
  const existingMealPlan = mealPlans.find(
    mp => mp.day_of_week === selectedSlot.day_of_week && mp.meal_type === selectedSlot.meal_type
  );

  const handleSelectRecipe = (recipeId: number): void => {
    if (existingMealPlan) {
      // Update existing entry
      dispatch(updateMealPlan({ id: existingMealPlan.id, recipeId }));
    } else {
      // Create new entry
      dispatch(addRecipeToSlot({
        recipe_id: recipeId,
        week_start_date: currentWeek,
        day_of_week: selectedSlot.day_of_week,
        meal_type: selectedSlot.meal_type
      }));
    }
  };

  const handleClose = (): void => {
    dispatch(closeRecipeModal());
    setSearchQuery('');
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Recipe</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>

        {/* Search Bar */}
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="modal-search-input"
          />
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'my-recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-recipes')}
          >
            My Recipes
          </button>
          <button
            className={`tab-btn ${activeTab === 'saved-recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved-recipes')}
          >
            Saved Recipes
          </button>
        </div>

        {/* Recipe List */}
        <div className="modal-recipe-list">
          {filteredRecipes.length === 0 ? (
            <p className="empty-state">No recipes found</p>
          ) : (
            filteredRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-item">
                <img
                  src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.image_url}`}
                  alt={recipe.title}
                  className="recipe-thumbnail"
                />
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.cooking_time} min • {recipe.difficulty}</p>
                </div>
                <button
                  className="select-btn"
                  onClick={() => handleSelectRecipe(recipe.id)}
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectionModal;
