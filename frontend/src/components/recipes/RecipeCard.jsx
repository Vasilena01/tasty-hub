import { Link } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ recipe }) {
  // Build full image URL
  const imageUrl = recipe.image_url
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${recipe.image_url}`
    : '/placeholder-recipe.jpg';

  // Format rating display
  const rating = recipe.average_rating ? recipe.average_rating.toFixed(1) : '0.0';

  return (
    <div className="recipe-card">
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
    </div>
  );
}

export default RecipeCard;
