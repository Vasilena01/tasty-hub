import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecipeById,
  selectCurrentRecipe,
  selectRecipeLoading,
  selectRecipeError
} from '../redux/slices/recipeSlice';
import './RecipeDetailPage.css';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const recipe = useSelector(selectCurrentRecipe);
  const loading = useSelector(selectRecipeLoading);
  const error = useSelector(selectRecipeError);

  // Fetch recipe on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
    }
  }, [dispatch, id]);

  // Build full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-recipe.jpg';
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  // Format instructions into steps
  const formatInstructions = (instructions) => {
    if (!instructions) return [];
    return instructions.split('\n').filter(line => line.trim());
  };

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-error">
        <h2>Error Loading Recipe</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/recipes')} className="back-btn">
          Back to Recipes
        </button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe Not Found</h2>
        <p>The recipe you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/recipes')} className="back-btn">
          Back to Recipes
        </button>
      </div>
    );
  }

  const instructionSteps = formatInstructions(recipe.instructions);

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-header">
        <Link to="/recipes" className="back-link">
          ← Back to Recipes
        </Link>
      </div>

      <div className="recipe-detail-content">
        {/* Image Section */}
        <div className="recipe-image-section">
          <img
            src={getImageUrl(recipe.image_url)}
            alt={recipe.title}
            className="recipe-main-image"
            onError={(e) => {
              e.target.src = '/placeholder-recipe.jpg';
            }}
          />
        </div>

        {/* Info Section */}
        <div className="recipe-info-section">
          <div className="recipe-badges">
            <span className={`badge difficulty-${recipe.difficulty}`}>
              {recipe.difficulty}
            </span>
            <span className="badge category-badge">
              {recipe.category}
            </span>
          </div>

          <h1 className="recipe-title">{recipe.title}</h1>

          <div className="recipe-author">
            By <strong>{recipe.first_name} {recipe.last_name}</strong>
            <span className="author-username">@{recipe.username}</span>
          </div>

          <p className="recipe-description">{recipe.description}</p>

          <div className="recipe-meta-cards">
            <div className="meta-card">
              <span className="meta-icon">⏱</span>
              <span className="meta-value">{recipe.cooking_time}</span>
              <span className="meta-label">minutes</span>
            </div>
            <div className="meta-card">
              <span className="meta-icon">🍽</span>
              <span className="meta-value">{recipe.servings}</span>
              <span className="meta-label">servings</span>
            </div>
            <div className="meta-card">
              <span className="meta-icon">⭐</span>
              <span className="meta-value">{recipe.average_rating?.toFixed(1) || '0.0'}</span>
              <span className="meta-label">{recipe.total_ratings || 0} ratings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients and Instructions */}
      <div className="recipe-details-grid">
        {/* Ingredients */}
        <div className="recipe-section ingredients-section">
          <h2>Ingredients</h2>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, index) => (
                <li key={index} className="ingredient-item">
                  <span className="ingredient-quantity">{ing.quantity}</span>
                  <span className="ingredient-unit">{ing.unit}</span>
                  <span className="ingredient-name">{ing.ingredient_name || ing.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-ingredients">No ingredients listed</p>
          )}
        </div>

        {/* Instructions */}
        <div className="recipe-section instructions-section">
          <h2>Instructions</h2>
          {instructionSteps.length > 0 ? (
            <ol className="instructions-list">
              {instructionSteps.map((step, index) => (
                <li key={index} className="instruction-step">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="no-instructions">No instructions available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
