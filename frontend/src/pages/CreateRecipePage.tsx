import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { toast } from 'react-toastify';
import {
  createRecipe,
  clearError,
  clearSuccess
} from '../redux/slices/recipeSlice';
import { RecipeForm } from '../components/recipes';
import './CreateRecipePage.css';

const CreateRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useAppSelector((state) => state.recipes.loading);
  const error = useAppSelector((state) => state.recipes.error);
  const createSuccess = useAppSelector((state) => state.recipes.createSuccess);

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
