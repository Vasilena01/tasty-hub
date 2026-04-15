import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchRecipeById,
  updateRecipe,
  clearError,
  clearSuccess,
  selectRecipeById
} from '../redux/slices/recipeSlice';
import { RecipeForm } from '../components/recipes';
import './EditRecipePage.css';

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const recipe = useSelector(selectRecipeById(id));
  const loading = useSelector((state) => state.recipes.loading);
  const error = useSelector((state) => state.recipes.error);
  const updateSuccess = useSelector((state) => state.recipes.updateSuccess);
  const currentUser = useSelector((state) => state.auth.user);

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Fetch recipe on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
    }
  }, [dispatch, id]);

  // Check ownership when recipe loads
  useEffect(() => {
    if (recipe && currentUser) {
      if (recipe.user_id !== currentUser.id) {
        toast.error('You can only edit your own recipes');
        navigate('/my-recipes');
      } else {
        setInitialDataLoaded(true);
      }
    }
  }, [recipe, currentUser, navigate]);

  // Handle success
  useEffect(() => {
    if (updateSuccess) {
      toast.success('Recipe updated successfully!');
      dispatch(clearSuccess());
      navigate(`/recipes/${id}`);
    }
  }, [updateSuccess, dispatch, navigate, id]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (formData) => {
    dispatch(updateRecipe({ id, formData }));
  };

  if (loading && !initialDataLoaded) {
    return (
      <div className="edit-recipe-page loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="edit-recipe-page error">
        <h2>Recipe Not Found</h2>
        <button onClick={() => navigate('/my-recipes')} className="back-btn">
          Back to My Recipes
        </button>
      </div>
    );
  }

  // Transform recipe data for form
  const initialData = {
    title: recipe.title || '',
    description: recipe.description || '',
    category: recipe.category || '',
    difficulty: recipe.difficulty || '',
    cooking_time: recipe.cooking_time || '',
    servings: recipe.servings || '',
    instructions: recipe.instructions || '',
    ingredients: recipe.ingredients?.map(ing => ({
      name: ing.ingredient_name || ing.name || '',
      quantity: ing.quantity || '',
      unit: ing.unit || ''
    })) || [{ name: '', quantity: '', unit: '' }],
    image_url: recipe.image_url
  };

  return (
    <div className="edit-recipe-page">
      <div className="page-header">
        <h1>Edit Recipe</h1>
        <p>Update your recipe details</p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        initialData={initialData}
        loading={loading}
        isEditing={true}
      />
    </div>
  );
}

export default EditRecipePage;
