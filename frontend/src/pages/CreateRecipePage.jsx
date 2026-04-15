import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createRecipe,
  clearError,
  clearSuccess
} from '../redux/slices/recipeSlice';
import { RecipeForm } from '../components/recipes';
import './CreateRecipePage.css';

function CreateRecipePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.recipes.loading);
  const error = useSelector((state) => state.recipes.error);
  const createSuccess = useSelector((state) => state.recipes.createSuccess);

  // Handle success - redirect to my recipes
  useEffect(() => {
    if (createSuccess) {
      toast.success('Recipe created successfully!');
      dispatch(clearSuccess());
      navigate('/my-recipes');
    }
  }, [createSuccess, dispatch, navigate]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (formData) => {
    dispatch(createRecipe(formData));
  };

  return (
    <div className="create-recipe-page">
      <div className="page-header">
        <h1>Create New Recipe</h1>
        <p>Share your culinary creation with the world</p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        loading={loading}
        isEditing={false}
      />
    </div>
  );
}

export default CreateRecipePage;
