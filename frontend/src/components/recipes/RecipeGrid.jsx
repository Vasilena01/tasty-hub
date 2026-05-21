import RecipeCard from './RecipeCard';
import './RecipeGrid.css';

function RecipeGrid({ recipes, loading, emptyMessage = 'No recipes found', showIngredients = false, showSaveButton = false }) {
  if (loading) {
    return (
      <div className="recipe-grid-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipes...</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipe-grid-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          showIngredients={showIngredients}
          showSaveButton={showSaveButton}
        />
      ))}
    </div>
  );
}

export default RecipeGrid;
