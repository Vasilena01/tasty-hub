import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveRecipe, unsaveRecipe } from '../../redux/slices/savedRecipesSlice';
import './RecipeCard.css';

function RecipeCard({ recipe, showIngredients = false, showSaveButton = false }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { savedRecipeIds } = useSelector((state) => state.savedRecipes);

  const isSaved = savedRecipeIds.has(recipe.id);

  // Build full image URL
  const imageUrl = recipe.image_url
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.image_url}`
    : '/placeholder-recipe.jpg';

  // Format rating display
  const rating = recipe.average_rating ? recipe.average_rating.toFixed(1) : '0.0';

  // Check if an ingredient is matched
  const isMatched = (ingredientName) => {
    if (!recipe.matched_ingredients || !Array.isArray(recipe.matched_ingredients)) {
      return false;
    }
    return recipe.matched_ingredients.some(matched =>
      matched.toLowerCase().includes(ingredientName.toLowerCase()) ||
      ingredientName.toLowerCase().includes(matched.toLowerCase())
    );
  };

  // Handle save/unsave toggle
  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await dispatch(unsaveRecipe(recipe.id)).unwrap();
      } else {
        await dispatch(saveRecipe(recipe.id)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="recipe-card"
      onMouseEnter={() => showIngredients && setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <Link to={`/recipes/${recipe.id}`} className="recipe-card-link">
        <div className="recipe-card-image">
          <img
            src={imageUrl}
            alt={recipe.title}
            onError={(e) => {
              e.target.src = '/placeholder-recipe.jpg';
            }}
          />
          <span className={`recipe-badge difficulty-${recipe.difficulty}`}>
            {recipe.difficulty}
          </span>
          {showIngredients && recipe.match_count && (
            <span className="recipe-badge match-badge">
              {recipe.match_count} matched
            </span>
          )}
        </div>

        <div className="recipe-card-content">
          <h3 className="recipe-card-title">{recipe.title}</h3>
          <p className="recipe-card-description">
            {recipe.description?.substring(0, 80)}
            {recipe.description?.length > 80 ? '...' : ''}
          </p>

          <div className="recipe-card-meta">
            <span className="recipe-category">{recipe.category}</span>
            <span className="recipe-time">{recipe.cooking_time} min</span>
            <span className="recipe-rating">
              <span className="star">★</span> {rating} ({recipe.total_ratings || 0})
            </span>
          </div>

          <div className="recipe-card-author">
            By {recipe.first_name} {recipe.last_name}
          </div>
        </div>
      </Link>

      {/* Save button - shown when enabled and user is authenticated */}
      {showSaveButton && isAuthenticated && (
        <button
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveToggle}
          disabled={isSaving}
          title={isSaved ? 'Unsave recipe' : 'Save recipe'}
        >
          <span className="save-icon">{isSaved ? '❤️' : '🤍'}</span>
        </button>
      )}

      {/* Ingredient overlay - shown on hover when ingredient search is active */}
      {showIngredients && showOverlay && recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="ingredient-overlay" onClick={(e) => e.stopPropagation()}>
          <h4>Ingredients:</h4>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, index) => (
              <li
                key={index}
                className={isMatched(ing.name) ? 'matched' : 'unmatched'}
              >
                <span className="ingredient-amount">
                  {ing.quantity} {ing.unit}
                </span>
                <span className="ingredient-name">{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
