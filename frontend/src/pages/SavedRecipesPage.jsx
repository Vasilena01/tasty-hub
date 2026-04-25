import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSavedRecipes } from '../redux/slices/savedRecipesSlice';
import RecipeCard from '../components/recipes/RecipeCard';
import '../styles/SavedRecipesPage.css';

const SavedRecipesPage = () => {
  const dispatch = useDispatch();
  const { savedRecipes, loading, error } = useSelector((state) => state.savedRecipes);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSavedRecipes());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <div className="saved-recipes-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your saved recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-recipes-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-recipes-page">
      <div className="saved-recipes-header">
        <h1>My Saved Recipes</h1>
        <p className="saved-count">
          {savedRecipes?.length || 0} {savedRecipes?.length === 1 ? 'recipe' : 'recipes'} saved
        </p>
      </div>

      {!savedRecipes || savedRecipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔖</div>
          <h2>No saved recipes yet</h2>
          <p>Start saving recipes you love to easily find them later!</p>
          <a href="/recipes" className="browse-link">
            Browse Recipes
          </a>
        </div>
      ) : (
        <div className="saved-recipes-grid">
          {savedRecipes.map((savedRecipe) => (
            <RecipeCard
              key={savedRecipe.recipe_id}
              recipe={savedRecipe}
              showSaveButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesPage;
