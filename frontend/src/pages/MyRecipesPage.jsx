import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchMyRecipes,
  deleteRecipe,
  clearError,
  clearSuccess,
  selectMyRecipes
} from '../redux/slices/recipeSlice';
import './MyRecipesPage.css';

function MyRecipesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const recipes = useSelector(selectMyRecipes);
  const loading = useSelector((state) => state.recipes.loading);
  const error = useSelector((state) => state.recipes.error);
  const deleteSuccess = useSelector((state) => state.recipes.deleteSuccess);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch recipes on mount
  useEffect(() => {
    dispatch(fetchMyRecipes());
  }, [dispatch]);

  // Handle delete success
  useEffect(() => {
    if (deleteSuccess) {
      toast.success('Recipe deleted successfully');
      dispatch(clearSuccess());
      setDeleteConfirm(null);
    }
  }, [deleteSuccess, dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDeleteClick = (recipe) => {
    setDeleteConfirm(recipe);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      dispatch(deleteRecipe(deleteConfirm.id));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Build full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-recipe.jpg';
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  // Safely format rating - handle both number and string types
  const formatRating = (rating) => {
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    return numRating.toFixed(1);
  };

  return (
    <div className="my-recipes-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Recipes</h1>
          <p>Manage your culinary creations</p>
        </div>
        <Link to="/create-recipe" className="create-btn">
          + Create Recipe
        </Link>
      </div>

      <div className="recipes-count">
        You have created <strong>{recipes.length}</strong> recipe{recipes.length !== 1 ? 's' : ''}
      </div>

      {loading && recipes.length === 0 ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No recipes yet</h3>
          <p>You haven't created any recipes yet. Share your first recipe!</p>
          <Link to="/create-recipe" className="create-btn-large">
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="my-recipes-grid">
          {recipes.map(recipe => (
            <div key={recipe.id} className="my-recipe-card">
              <Link to={`/recipes/${recipe.id}`} className="recipe-link">
                <div className="recipe-image">
                  <img
                    src={getImageUrl(recipe.image_url)}
                    alt={recipe.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-recipe.jpg';
                    }}
                  />
                </div>
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <div className="recipe-stats">
                    <span>⭐ {formatRating(recipe.average_rating)}</span>
                    <span>❤️ {recipe.total_saves || 0} saves</span>
                  </div>
                </div>
              </Link>
              <div className="recipe-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClick(recipe)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Recipe?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.title}"?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRecipesPage;
