import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ImageUpload from './ImageUpload';
import IngredientList from './IngredientList';
import './RecipeForm.css';

// Validation schema
const recipeSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  category: yup
    .string()
    .required('Category is required')
    .oneOf(['breakfast', 'lunch', 'dinner', 'dessert'], 'Invalid category'),
  difficulty: yup
    .string()
    .required('Difficulty is required')
    .oneOf(['easy', 'medium', 'hard'], 'Invalid difficulty'),
  cooking_time: yup
    .number()
    .typeError('Cooking time must be a number')
    .required('Cooking time is required')
    .positive('Cooking time must be positive')
    .integer('Cooking time must be a whole number'),
  servings: yup
    .number()
    .typeError('Servings must be a number')
    .required('Servings is required')
    .positive('Servings must be positive')
    .integer('Servings must be a whole number'),
  instructions: yup
    .string()
    .required('Instructions are required')
    .min(20, 'Instructions must be at least 20 characters'),
  ingredients: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Ingredient name is required'),
        quantity: yup.string().required('Quantity is required'),
        unit: yup.string().required('Unit is required')
      })
    )
    .min(1, 'At least one ingredient is required'),
  image: yup.mixed().test('required', 'Recipe image is required', function(value) {
    // Allow if editing with existing image
    if (this.options.context?.hasExistingImage) return true;
    // Check if file is selected
    return value && value.length > 0;
  })
});

function RecipeForm({ onSubmit, initialData = null, isEditing = false, loading = false }) {
  const defaultValues = initialData || {
    title: '',
    description: '',
    category: '',
    difficulty: '',
    cooking_time: '',
    servings: '',
    instructions: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    image: null
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(recipeSchema),
    defaultValues,
    context: { hasExistingImage: !!initialData?.image_url }
  });

  // Dynamic ingredient list
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const handleFormSubmit = async (data) => {
    const formData = new FormData();

    // Append all text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('difficulty', data.difficulty);
    formData.append('cooking_time', data.cooking_time);
    formData.append('servings', data.servings);
    formData.append('instructions', data.instructions);

    // Append ingredients as JSON string
    formData.append('ingredients', JSON.stringify(data.ingredients));

    // Append image file if selected
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    await onSubmit(formData);
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Basic Info Section */}
      <section className="form-section">
        <h3 className="section-title">Basic Information</h3>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter recipe title"
            {...register('title')}
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            placeholder="Describe your recipe..."
            rows="3"
            {...register('description')}
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              {...register('category')}
              className={errors.category ? 'input-error' : ''}
            >
              <option value="">Select category</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
            </select>
            {errors.category && <span className="error-message">{errors.category.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty *</label>
            <select
              id="difficulty"
              {...register('difficulty')}
              className={errors.difficulty ? 'input-error' : ''}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && <span className="error-message">{errors.difficulty.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cooking_time">Cooking Time (minutes) *</label>
            <input
              id="cooking_time"
              type="number"
              placeholder="e.g., 30"
              min="1"
              {...register('cooking_time')}
              className={errors.cooking_time ? 'input-error' : ''}
            />
            {errors.cooking_time && <span className="error-message">{errors.cooking_time.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings *</label>
            <input
              id="servings"
              type="number"
              placeholder="e.g., 4"
              min="1"
              {...register('servings')}
              className={errors.servings ? 'input-error' : ''}
            />
            {errors.servings && <span className="error-message">{errors.servings.message}</span>}
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="form-section">
        <h3 className="section-title">Recipe Image</h3>
        <ImageUpload
          register={register}
          error={errors.image}
          existingImage={initialData?.image_url}
        />
      </section>

      {/* Ingredients Section */}
      <section className="form-section">
        <h3 className="section-title">Ingredients</h3>
        <IngredientList
          fields={fields}
          register={register}
          remove={remove}
          append={append}
          errors={errors}
        />
      </section>

      {/* Instructions Section */}
      <section className="form-section">
        <h3 className="section-title">Instructions</h3>
        <div className="form-group">
          <label htmlFor="instructions">Step-by-step instructions *</label>
          <textarea
            id="instructions"
            placeholder="1. Preheat oven to 350F...&#10;2. Mix dry ingredients...&#10;3. ..."
            rows="8"
            {...register('instructions')}
            className={errors.instructions ? 'input-error' : ''}
          />
          {errors.instructions && <span className="error-message">{errors.instructions.message}</span>}
          <p className="form-hint">Write each step on a new line for best readability</p>
        </div>
      </section>

      {/* Submit */}
      <div className="form-actions">
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Recipe')}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
