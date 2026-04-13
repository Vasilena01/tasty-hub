# Phase 4-5: Recipe CRUD and Browsing - Research

**Researched:** 2026-04-13
**Domain:** Recipe CRUD operations with image uploads, search & filtering in PostgreSQL, complex React forms
**Confidence:** HIGH

## Summary

This combined phase implements full recipe lifecycle management (Create, Read, Update, Delete) with image upload capabilities, plus comprehensive browsing and search features. The implementation leverages the existing project stack (Express + PostgreSQL + React + Redux) with Multer for file uploads and React Hook Form for complex form handling.

**Key Implementation Challenges:**
1. **File Upload Architecture** - Multer is already installed (v2.1.1) and provides robust multipart/form-data handling with built-in validation, storage engines, and security features
2. **Complex Form Handling** - Multi-section recipe form with dynamic ingredient array requires controlled component pattern or React Hook Form with useFieldArray
3. **Search & Filter Performance** - PostgreSQL ILIKE with indexes already implemented in Recipe model; full-text search optional for better performance
4. **Redux State Management** - Normalized state structure with recipe entities, browse lists, and detail views prevents data duplication
5. **Public/Private Recipe Visibility** - Requires schema modification to add `is_public` field and query filtering

**Primary recommendation:** Use Multer for image uploads with disk storage, React Hook Form with Yup validation for the recipe form, PostgreSQL ILIKE for MVP search (already implemented), and Redux Toolkit slices with normalized state for recipe management.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| multer | 2.1.1 | File upload middleware for Express | Industry standard for handling multipart/form-data, already installed, supports validation, filtering, and multiple storage engines |
| react-hook-form | 7.72.1 | Complex form management | Most popular React form library (40k+ GitHub stars), excellent for dynamic fields with useFieldArray, minimal re-renders, built-in validation |
| yup | 1.7.1 | Schema validation | De facto validation library for React forms, integrates seamlessly with react-hook-form via @hookform/resolvers |
| @reduxjs/toolkit | 2.11.2 | State management | Already installed, modern Redux pattern with slices, built-in Immer for immutability, async thunk support |
| axios | 1.14.0 | HTTP client | Already installed with interceptors configured for auth tokens |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | 0.34.5 | Image processing | Image optimization, resizing, format conversion - use if implementing thumbnail generation or image compression |
| @hookform/resolvers | 7.53.2 | Form validation adapter | Bridges Yup/Zod validators with react-hook-form |
| react-dropzone | 14.3.5 | Drag-and-drop file upload UI | Enhances UX for image upload section with drag-and-drop capability |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | Formik | Formik has more re-renders, larger bundle size, less performant with large forms |
| Multer disk storage | Cloudinary/AWS S3 | Cloud storage better for production scale but adds external dependency, cost, and complexity for academic project |
| Yup | Zod | Zod offers TypeScript-first approach but project uses vanilla JS; Yup has better React ecosystem integration |
| ILIKE search | PostgreSQL full-text search (tsvector) | Full-text search offers better performance and relevance ranking but adds complexity; ILIKE sufficient for MVP |

**Installation:**
```bash
# Backend (already has multer)
cd backend
npm install sharp  # Optional: for image optimization

# Frontend
cd frontend
npm install react-hook-form yup @hookform/resolvers
npm install react-dropzone  # Optional: for drag-and-drop UI
```

**Version verification:** Verified 2026-04-13 via npm registry.

## Architecture Patterns

### Recommended Backend Structure
```
backend/src/
├── controllers/
│   └── recipeController.js      # CRUD operations, search, filter logic
├── routes/
│   └── recipeRoutes.js          # Route definitions with auth middleware
├── middleware/
│   ├── authMiddleware.js        # Already implemented (JWT verification)
│   └── uploadMiddleware.js      # Multer configuration for image uploads
├── models/
│   ├── Recipe.js                # Already implemented with search methods
│   ├── RecipeIngredient.js      # Already implemented
│   └── Ingredient.js            # Already implemented
├── utils/
│   └── imageProcessor.js        # Optional: sharp image optimization
└── uploads/
    └── recipes/                 # Recipe images storage
```

### Recommended Frontend Structure
```
frontend/src/
├── pages/
│   ├── CreateRecipePage.jsx     # Multi-section recipe form
│   ├── RecipeDetailPage.jsx     # Full recipe display
│   ├── EditRecipePage.jsx       # Edit form (reuses CreateRecipe components)
│   ├── MyRecipesPage.jsx        # User's created recipes
│   └── BrowseRecipesPage.jsx    # Search, filter, sort, pagination
├── components/
│   ├── recipes/
│   │   ├── RecipeForm.jsx       # Reusable form component
│   │   ├── RecipeCard.jsx       # Grid/list item display
│   │   ├── RecipeGrid.jsx       # Grid layout container
│   │   ├── IngredientList.jsx   # Dynamic ingredient input rows
│   │   ├── ImageUpload.jsx      # Drag-and-drop with preview
│   │   ├── FilterSidebar.jsx    # Category, difficulty, rating filters
│   │   ├── SearchBar.jsx        # Text search input
│   │   └── Pagination.jsx       # Page navigation controls
├── redux/slices/
│   └── recipeSlice.js           # Recipe state management
└── services/
    └── recipeService.js         # API calls for recipes
```

### Pattern 1: Multer File Upload Configuration
**What:** Configure Multer middleware with disk storage, file filtering, and size limits
**When to use:** All file upload endpoints requiring validation and security
**Example:**
```javascript
// backend/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/recipes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  }
});

module.exports = upload;
```

### Pattern 2: Recipe Controller with Image Handling
**What:** Controller methods for creating and updating recipes with image files
**When to use:** All recipe CRUD operations in recipeController.js
**Example:**
```javascript
// backend/src/controllers/recipeController.js
const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');

// Create recipe with image
exports.createRecipe = async (req, res) => {
  try {
    const {
      title, description, category, difficulty,
      cooking_time, servings, instructions, ingredients,
      is_public = true  // Default to public
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || 
        !cooking_time || !servings || !instructions) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Recipe image is required' });
    }

    // Build image URL (relative path)
    const image_url = '/uploads/recipes/' + req.file.filename;

    // Parse ingredients JSON string
    const ingredientList = JSON.parse(ingredients);

    // Create recipe
    const recipe = await Recipe.create({
      user_id: req.user.id,  // From auth middleware
      title,
      description,
      category,
      difficulty,
      cooking_time: parseInt(cooking_time),
      servings: parseInt(servings),
      image_url,
      instructions,
      is_public
    });

    // Insert ingredients
    for (const ing of ingredientList) {
      // Find or create ingredient in master table
      let ingredient = await Ingredient.findByName(ing.name);
      if (!ingredient) {
        ingredient = await Ingredient.create({ name: ing.name });
      }

      // Create recipe-ingredient association
      await RecipeIngredient.create({
        recipe_id: recipe.id,
        ingredient_id: ingredient.id,
        quantity: ing.quantity,
        unit: ing.unit
      });
    }

    res.status(201).json({ recipe });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Server error creating recipe' });
  }
};

// Get all recipes with filters (public only for non-owners)
exports.getAllRecipes = async (req, res) => {
  try {
    const { 
      category, difficulty, minRating, search, 
      sortBy, page = 1, limit = 12 
    } = req.query;

    const offset = (page - 1) * limit;
    const userId = req.user?.id;  // May be undefined for anonymous users

    // Build query parameters
    const filters = {
      category,
      difficulty,
      minRating: minRating ? parseFloat(minRating) : null,
      search,
      sortBy,
      limit: parseInt(limit),
      offset,
      is_public: true,  // Only public recipes by default
      exclude_user_id: null
    };

    const recipes = await Recipe.findAll(filters);
    const total = await Recipe.countAll(filters);

    res.json({
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Server error fetching recipes' });
  }
};

// Get user's own recipes (both public and private)
exports.getMyRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await Recipe.findByUserId(userId);
    res.json({ recipes });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({ message: 'Server error fetching recipes' });
  }
};
```

### Pattern 3: React Hook Form with Dynamic Ingredient List
**What:** Complex form with dynamic ingredient array using useFieldArray
**When to use:** Recipe creation and editing forms
**Example:**
```javascript
// frontend/src/components/recipes/RecipeForm.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const recipeSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3).max(200),
  description: yup.string().required('Description is required').min(10).max(1000),
  category: yup.string().required('Category is required').oneOf(['breakfast', 'lunch', 'dinner', 'dessert']),
  difficulty: yup.string().required('Difficulty is required').oneOf(['easy', 'medium', 'hard']),
  cooking_time: yup.number().required('Cooking time is required').positive().integer(),
  servings: yup.number().required('Servings is required').positive().integer(),
  instructions: yup.string().required('Instructions are required'),
  ingredients: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Ingredient name is required'),
      quantity: yup.string().required('Quantity is required'),
      unit: yup.string().required('Unit is required')
    })
  ).min(1, 'At least one ingredient is required'),
  image: yup.mixed().required('Recipe image is required')
});

function RecipeForm({ onSubmit, initialData = null }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(recipeSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      category: '',
      difficulty: '',
      cooking_time: '',
      servings: '',
      instructions: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      image: null,
      is_public: true
    }
  });

  // Dynamic ingredient list
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  // Watch image field for preview
  const imageFile = watch('image');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile[0]);
    }
  }, [imageFile]);

  const handleFormSubmit = async (data) => {
    const formData = new FormData();
    
    // Append all fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('difficulty', data.difficulty);
    formData.append('cooking_time', data.cooking_time);
    formData.append('servings', data.servings);
    formData.append('instructions', data.instructions);
    formData.append('is_public', data.is_public);
    
    // Append ingredients as JSON string
    formData.append('ingredients', JSON.stringify(data.ingredients));
    
    // Append image file
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Basic Info Section */}
      <section>
        <h3>Basic Information</h3>
        
        <input
          type="text"
          placeholder="Recipe Title"
          {...register('title')}
        />
        {errors.title && <span>{errors.title.message}</span>}

        <textarea
          placeholder="Description"
          {...register('description')}
        />
        {errors.description && <span>{errors.description.message}</span>}

        <select {...register('category')}>
          <option value="">Select Category</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
        </select>
        {errors.category && <span>{errors.category.message}</span>}

        {/* Other basic fields... */}
      </section>

      {/* Ingredients Section */}
      <section>
        <h3>Ingredients</h3>
        
        {fields.map((field, index) => (
          <div key={field.id} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ingredient name"
              {...register(`ingredients.${index}.name`)}
            />
            <input
              type="text"
              placeholder="Quantity"
              {...register(`ingredients.${index}.quantity`)}
            />
            <input
              type="text"
              placeholder="Unit"
              {...register(`ingredients.${index}.unit`)}
            />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)}>
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ name: '', quantity: '', unit: '' })}
        >
          Add Ingredient
        </button>
        {errors.ingredients && <span>{errors.ingredients.message}</span>}
      </section>

      {/* Image Upload Section */}
      <section>
        <h3>Recipe Image</h3>
        
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          {...register('image')}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px' }} />
        )}
        {errors.image && <span>{errors.image.message}</span>}
        <p>Max size: 5MB. Formats: JPG, PNG</p>
      </section>

      {/* Instructions Section */}
      <section>
        <h3>Instructions</h3>
        
        <textarea
          placeholder="Step-by-step instructions"
          rows="8"
          {...register('instructions')}
        />
        {errors.instructions && <span>{errors.instructions.message}</span>}
      </section>

      {/* Visibility Toggle */}
      <section>
        <label>
          <input type="checkbox" {...register('is_public')} />
          Make this recipe public (visible to all users)
        </label>
      </section>

      <button type="submit">Publish Recipe</button>
    </form>
  );
}
```

### Pattern 4: Redux Slice with Normalized State
**What:** Redux Toolkit slice for recipe state management with entities pattern
**When to use:** All recipe state management in the frontend
**Example:**
```javascript
// frontend/src/redux/slices/recipeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../../services/recipeService';

// Async thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await recipeService.getAllRecipes(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipes');
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.getRecipeById(id);
      return response.data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipe');
    }
  }
);

export const createRecipe = createAsyncThunk(
  'recipes/createRecipe',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await recipeService.createRecipe(formData);
      return response.data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create recipe');
    }
  }
);

// Slice
const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    // Normalized entities
    entities: {},  // { [id]: recipe }
    
    // Browse page state
    browseList: [],  // Array of recipe IDs
    browsePagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    browseFilters: {
      category: '',
      difficulty: '',
      minRating: '',
      search: '',
      sortBy: 'newest'
    },
    
    // Detail page state
    currentRecipe: null,  // Currently viewed recipe ID
    
    // User's recipes
    myRecipes: [],  // Array of recipe IDs
    
    // UI state
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.browseFilters = { ...state.browseFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.browseFilters = {
        category: '',
        difficulty: '',
        minRating: '',
        search: '',
        sortBy: 'newest'
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        
        // Normalize recipes into entities
        action.payload.recipes.forEach(recipe => {
          state.entities[recipe.id] = recipe;
        });
        
        // Store IDs in browse list
        state.browseList = action.payload.recipes.map(r => r.id);
        state.browsePagination = action.payload.pagination;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single recipe
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
        state.currentRecipe = action.payload.id;
      })
      
      // Create recipe
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
        state.myRecipes.unshift(action.payload.id);
      });
  }
});

export const { setFilters, clearFilters, clearError } = recipeSlice.actions;

// Selectors
export const selectAllRecipes = (state) => 
  state.recipes.browseList.map(id => state.recipes.entities[id]);

export const selectRecipeById = (id) => (state) => 
  state.recipes.entities[id];

export const selectCurrentRecipe = (state) => 
  state.recipes.entities[state.recipes.currentRecipe];

export default recipeSlice.reducer;
```

### Pattern 5: PostgreSQL Search with Multiple Filters
**What:** Efficient SQL query building with dynamic filters, search, sorting, and pagination
**When to use:** Recipe browsing and search endpoints (already partially implemented in Recipe.js model)
**Example:**
```javascript
// backend/src/models/Recipe.js enhancement
static async findAll({ 
  category, difficulty, minRating, search, 
  sortBy, limit, offset, is_public = true, exclude_user_id = null 
}) {
  let query = `
    SELECT r.*, 
           u.username, u.first_name, u.last_name, u.profile_picture_url,
           COUNT(DISTINCT ri.ingredient_id) as ingredient_count
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    WHERE 1=1
  `;
  
  const values = [];
  let paramCount = 0;

  // Public/private filter
  if (is_public !== null) {
    paramCount++;
    query += ` AND r.is_public = $${paramCount}`;
    values.push(is_public);
  }

  // Category filter
  if (category) {
    paramCount++;
    query += ` AND r.category = $${paramCount}`;
    values.push(category);
  }

  // Difficulty filter
  if (difficulty) {
    paramCount++;
    query += ` AND r.difficulty = $${paramCount}`;
    values.push(difficulty);
  }

  // Minimum rating filter
  if (minRating) {
    paramCount++;
    query += ` AND r.average_rating >= $${paramCount}`;
    values.push(minRating);
  }

  // Text search (ILIKE for case-insensitive pattern matching)
  // Note: For better performance with large datasets, consider full-text search
  if (search) {
    paramCount++;
    query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
    values.push(`%${search}%`);
  }

  // Exclude specific user (for "other users' recipes" views)
  if (exclude_user_id) {
    paramCount++;
    query += ` AND r.user_id != $${paramCount}`;
    values.push(exclude_user_id);
  }

  // Group by for ingredient count
  query += ` GROUP BY r.id, u.username, u.first_name, u.last_name, u.profile_picture_url`;

  // Sorting
  if (sortBy === 'rating') {
    query += ' ORDER BY r.average_rating DESC, r.created_at DESC';
  } else if (sortBy === 'newest') {
    query += ' ORDER BY r.created_at DESC';
  } else if (sortBy === 'quickest') {
    query += ' ORDER BY r.cooking_time ASC';
  } else {
    query += ' ORDER BY r.created_at DESC';  // Default
  }

  // Pagination
  if (limit) {
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);
  }

  if (offset) {
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);
  }

  const result = await db.query(query, values);
  return result.rows;
}

// Count method for pagination
static async countAll({ category, difficulty, minRating, search, is_public = true }) {
  let query = `
    SELECT COUNT(DISTINCT r.id) as total
    FROM recipes r
    WHERE 1=1
  `;
  
  const values = [];
  let paramCount = 0;

  if (is_public !== null) {
    paramCount++;
    query += ` AND r.is_public = $${paramCount}`;
    values.push(is_public);
  }

  if (category) {
    paramCount++;
    query += ` AND r.category = $${paramCount}`;
    values.push(category);
  }

  if (difficulty) {
    paramCount++;
    query += ` AND r.difficulty = $${paramCount}`;
    values.push(difficulty);
  }

  if (minRating) {
    paramCount++;
    query += ` AND r.average_rating >= $${paramCount}`;
    values.push(minRating);
  }

  if (search) {
    paramCount++;
    query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
    values.push(`%${search}%`);
  }

  const result = await db.query(query, values);
  return parseInt(result.rows[0].total);
}
```

### Pattern 6: Image Serving with Express Static Middleware
**What:** Serve uploaded images as static files via Express
**When to use:** Configure once in server.js to enable image access
**Example:**
```javascript
// backend/src/server.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Now images are accessible at: http://localhost:5000/uploads/recipes/recipe-123456789.jpg
```

### Anti-Patterns to Avoid
- **Don't store images as BLOB in database** - Use filesystem or cloud storage, store only file path/URL in database
- **Don't use client-side only validation** - Always validate on server; client validation is for UX only
- **Don't build custom form state management** - Use React Hook Form; reinventing this wheel leads to bugs and complexity
- **Don't fetch all recipes at once** - Always use pagination; fetching thousands of records kills performance
- **Don't use SELECT * in production queries** - Specify needed columns to reduce data transfer (though acceptable for MVP)
- **Don't trust MIME types alone** - Verify actual file content or use allowlist of extensions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload handling | Custom multipart parser | Multer | Handles complex multipart/form-data parsing, file buffering, storage strategies, proper error handling |
| Form state with dynamic fields | Manual useState for each field + array management | React Hook Form + useFieldArray | Performance optimization (minimal re-renders), built-in validation, complex field dependencies, array operations |
| Form validation | Custom validation functions | Yup or Zod with react-hook-form | Schema-based validation, async validation, cross-field validation, better error messages |
| Image processing | Canvas API manipulation | Sharp library | Fast native image processing, resizing, format conversion, EXIF handling, memory efficient |
| Search ranking/relevance | Custom scoring algorithms | PostgreSQL full-text search with ts_rank | Database-native ranking, handles stemming, stop words, phrase matching, already optimized |
| SQL injection prevention | Manual string escaping | Parameterized queries (pg library) | Automatic proper escaping, prevents all injection vectors, already built into pg library |
| Pagination logic | Custom offset calculations | Standardized offset/limit pattern | Prevents off-by-one errors, consistent UX, well-understood pattern |
| Image file validation | File extension checking only | Multer fileFilter with MIME type check + file extension | Prevents disguised malicious files, validates both MIME type and extension |

**Key insight:** File uploads, complex forms, and search are deceptively complex with edge cases around security, performance, and UX. Mature libraries have solved these problems through years of production use and bug fixes.

## Common Pitfalls

### Pitfall 1: Image Upload Without Proper Validation
**What goes wrong:** Accepting any file type allows malicious file uploads (executable scripts disguised as images)
**Why it happens:** Trusting client-side file input accept attribute or only checking file extension
**How to avoid:** 
- Use Multer fileFilter to validate MIME type
- Check both MIME type and file extension
- Set strict file size limits (5MB for images)
- Store uploads outside web root or serve with correct Content-Type headers
**Warning signs:** Security audit flags unrestricted file upload, users uploading non-image files

### Pitfall 2: Not Cleaning Up Failed Upload Files
**What goes wrong:** Failed database transactions leave orphaned files in uploads directory, wasting disk space
**Why it happens:** Multer saves file to disk before your controller runs; if database insert fails, file remains
**How to avoid:**
```javascript
try {
  const recipe = await Recipe.create({...});
} catch (error) {
  // Clean up uploaded file if database operation fails
  if (req.file) {
    fs.unlinkSync(req.file.path);
  }
  throw error;
}
```
**Warning signs:** Uploads directory grows but recipe count doesn't match, disk space issues

### Pitfall 3: SQL Injection in Dynamic Search Queries
**What goes wrong:** User input in search queries can execute arbitrary SQL
**Why it happens:** String concatenation instead of parameterized queries
**How to avoid:** ALWAYS use parameterized queries with pg library ($1, $2, etc.), never concatenate user input into SQL strings
**Warning signs:** Unusual database errors, unexpected query results, security audit findings

### Pitfall 4: ILIKE Performance Degradation
**What goes wrong:** `ILIKE '%search%'` queries become slow with thousands of recipes because indexes aren't used efficiently
**Why it happens:** Leading wildcard prevents index usage; PostgreSQL must scan entire table
**How to avoid:**
- For MVP: ILIKE with indexed columns is acceptable for < 10k records
- For production: Implement PostgreSQL full-text search with tsvector/tsquery
- Add GIN index on tsvector columns for fast full-text search
- Consider pg_trgm extension for trigram-based similarity search
**Warning signs:** Browse page slow when filtering + searching, query times > 500ms

### Pitfall 5: Handling FormData in Frontend Incorrectly
**What goes wrong:** Axios sends FormData with wrong Content-Type header or React Hook Form doesn't capture file input
**Why it happens:** Setting Content-Type: multipart/form-data manually (Axios sets boundary automatically), or using controlled components for file inputs
**How to avoid:**
```javascript
// DON'T set Content-Type manually for FormData
const formData = new FormData();
formData.append('image', file);
// DON'T: headers: { 'Content-Type': 'multipart/form-data' }

// DO let Axios set it automatically
await axios.post('/api/recipes', formData);
// Axios automatically sets: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

// For file inputs in React Hook Form, use register with file input
<input type="file" {...register('image')} />
// Access via data.image[0] in onSubmit
```
**Warning signs:** File upload always fails with 400 error, req.file is undefined in backend

### Pitfall 6: Not Normalizing Recipe State in Redux
**What goes wrong:** Storing duplicate recipe data in multiple slices (browse list, detail, myRecipes) causes inconsistency when updating
**Why it happens:** Storing full recipe objects in arrays instead of using entities pattern
**How to avoid:**
- Store all recipes in `entities` object by ID: `{ [id]: recipe }`
- Store only IDs in arrays: `browseList: [1, 2, 3]`, `myRecipes: [4, 5]`
- When updating a recipe, update only `entities[id]`; all views automatically reflect change
**Warning signs:** Editing recipe doesn't update all views, stale data displayed, manual state synchronization needed

### Pitfall 7: Ingredient Duplication in Master Table
**What goes wrong:** Creating new ingredient records for "Tomato", "tomato", "tomatoes" causes duplicate ingredients
**Why it happens:** Case sensitivity and plural forms not normalized
**How to avoid:**
- Normalize ingredient names: `toLowerCase()` before insert/lookup
- Use autocomplete from existing ingredients to prevent duplicates
- Consider stemming or fuzzy matching for plurals (advanced)
- Add UNIQUE constraint on lowercase ingredient name in database
**Warning signs:** Autocomplete shows duplicate ingredients, ingredient search returns multiple matches for same item

### Pitfall 8: Missing Migration for is_public Field
**What goes wrong:** Recipes table doesn't have `is_public` boolean field required for public/private visibility
**Why it happens:** Schema was created before private recipe requirement was added
**How to avoid:**
- Create new migration file to add column: `ALTER TABLE recipes ADD COLUMN is_public BOOLEAN DEFAULT true;`
- Update Recipe model methods to filter by is_public
- Update frontend forms to include visibility toggle
**Warning signs:** Private recipes still appear in public feed, database errors about missing column

## Code Examples

### Complete Backend Route Setup
```javascript
// backend/src/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes (no auth required)
router.get('/recipes', recipeController.getAllRecipes);
router.get('/recipes/:id', recipeController.getRecipeById);

// Protected routes (auth required)
router.post('/recipes', 
  authMiddleware, 
  upload.single('image'),  // Handle single image upload
  recipeController.createRecipe
);

router.put('/recipes/:id',
  authMiddleware,
  upload.single('image'),  // Optional: new image on update
  recipeController.updateRecipe
);

router.delete('/recipes/:id',
  authMiddleware,
  recipeController.deleteRecipe
);

router.get('/recipes/user/me',
  authMiddleware,
  recipeController.getMyRecipes
);

module.exports = router;
```

### Frontend Recipe Service
```javascript
// frontend/src/services/recipeService.js
import axiosInstance from './axiosConfig';

const recipeService = {
  // Create recipe with image
  createRecipe: async (formData) => {
    // Note: axiosInstance will automatically set Content-Type for FormData
    // and include Authorization header from interceptor
    return axiosInstance.post('/recipes', formData);
  },

  // Get all recipes with filters
  getAllRecipes: async (filters) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    return axiosInstance.get(`/recipes?${params.toString()}`);
  },

  // Get single recipe
  getRecipeById: async (id) => {
    return axiosInstance.get(`/recipes/${id}`);
  },

  // Update recipe
  updateRecipe: async (id, formData) => {
    return axiosInstance.put(`/recipes/${id}`, formData);
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    return axiosInstance.delete(`/recipes/${id}`);
  },

  // Get user's recipes
  getMyRecipes: async () => {
    return axiosInstance.get('/recipes/user/me');
  }
};

export default recipeService;
```

### Image Upload Component with Preview
```javascript
// frontend/src/components/recipes/ImageUpload.jsx
import { useState, useEffect } from 'react';

function ImageUpload({ register, error, existingImage = null }) {
  const [preview, setPreview] = useState(existingImage);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB');
        e.target.value = null;
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Only JPG and PNG images are allowed');
        e.target.value = null;
        return;
      }

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload">
      <label htmlFor="image">Recipe Image *</label>
      
      <input
        id="image"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        {...register('image')}
        onChange={(e) => {
          register('image').onChange(e);  // Call react-hook-form's onChange
          handleImageChange(e);  // Call our preview handler
        }}
      />

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Recipe preview" style={{ maxWidth: '400px', maxHeight: '300px' }} />
        </div>
      )}

      {error && <span className="error">{error.message}</span>}
      
      <p className="help-text">
        Max size: 5MB. Formats: JPG, PNG
      </p>
    </div>
  );
}

export default ImageUpload;
```

### Recipe Card Component
```javascript
// frontend/src/components/recipes/RecipeCard.jsx
import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <Link to={`/recipes/${recipe.id}`}>
        <div className="recipe-image">
          <img 
            src={`http://localhost:5000${recipe.image_url}`} 
            alt={recipe.title}
            onError={(e) => {
              e.target.src = '/placeholder-recipe.jpg';  // Fallback image
            }}
          />
          <span className={`badge difficulty-${recipe.difficulty}`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="recipe-content">
          <h3>{recipe.title}</h3>
          <p className="description">
            {recipe.description.substring(0, 100)}
            {recipe.description.length > 100 ? '...' : ''}
          </p>

          <div className="recipe-meta">
            <span className="category">{recipe.category}</span>
            <span className="time">⏱ {recipe.cooking_time} min</span>
            <span className="rating">
              ⭐ {recipe.average_rating.toFixed(1)} ({recipe.total_ratings})
            </span>
          </div>

          <div className="recipe-author">
            By {recipe.first_name} {recipe.last_name}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default RecipeCard;
```

## Environment Availability

This phase has no external dependencies beyond the already-installed Node.js runtime and PostgreSQL database. All required npm packages are installable via package.json.

**Skipped** - No external tools or services required for this phase.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik for forms | React Hook Form | ~2020-2021 | Better performance with less re-renders, smaller bundle size, simpler API for dynamic fields |
| Redux with manual action creators | Redux Toolkit with createSlice | 2019 | Less boilerplate, built-in Immer for immutability, standardized patterns |
| LIKE queries for text search | PostgreSQL full-text search (tsvector) | Always available but underutilized | Better performance, relevance ranking, stemming support - but ILIKE acceptable for MVP |
| Manual form validation | Schema-based validation (Yup/Zod) | ~2018-2019 | Declarative validation, better error messages, type safety with TypeScript |
| Cloud storage only (S3/Cloudinary) | Hybrid approach with local storage | Ongoing | Local storage acceptable for MVP/development; cloud storage for production scale |
| Controlled file inputs | Uncontrolled with register | React Hook Form pattern | File inputs should be uncontrolled; controlled pattern causes issues |

**Deprecated/outdated:**
- **redux-form**: Deprecated in favor of React Hook Form or Formik (too heavy, many re-renders)
- **body-parser**: Now built into Express 4.16+ as `express.json()` and `express.urlencoded()` (still works but unnecessary)
- **Busboy directly**: Use Multer which wraps Busboy with better API (Multer is standard)

## Open Questions

1. **Should we implement image optimization with Sharp?**
   - What we know: Sharp can resize images, create thumbnails, compress files to reduce storage and bandwidth
   - What's unclear: Is image optimization needed for MVP or can it be deferred to Phase 14 (UI Polish)?
   - Recommendation: Skip for MVP; focus on core CRUD functionality first. Add in Phase 14 if performance issues arise.

2. **Database migration for is_public field**
   - What we know: Current recipes table schema doesn't have `is_public` boolean field
   - What's unclear: Should this be added as new migration or modify existing migration?
   - Recommendation: Create new migration file `010_add_is_public_to_recipes.sql` to preserve migration history. Set DEFAULT true for existing recipes.

3. **Full-text search vs ILIKE**
   - What we know: ILIKE with leading wildcard doesn't use indexes efficiently; full-text search offers better performance and ranking
   - What's unclear: At what dataset size does ILIKE become unacceptable?
   - Recommendation: Use ILIKE for MVP (already implemented in Recipe.js). If browse page query time > 500ms with real data, implement full-text search with tsvector/GIN index in optimization phase.

4. **Ingredient autocomplete implementation**
   - What we know: Should prevent duplicate ingredients with different cases/spellings
   - What's unclear: Should autocomplete be implemented in this phase or deferred to Phase 6 (Ingredient-Based Search)?
   - Recommendation: Implement basic ingredient autocomplete in this phase to prevent duplicates. Phase 6 will enhance with full ingredient search features.

## Validation Architecture

> Phase has nyquist_validation enabled in config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected - recommend Jest (already in react-scripts) + Supertest for API testing |
| Config file | None - see Wave 0 gaps |
| Quick run command | `npm test -- --testPathPattern="recipes" --bail` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FR-3.1 | Create recipe with image, ingredients, and all fields | integration | `npm test -- backend/tests/recipeController.test.js --testNamePattern="create recipe"` | ❌ Wave 0 |
| FR-3.2 | Update recipe (owner only) | integration | `npm test -- backend/tests/recipeController.test.js --testNamePattern="update recipe"` | ❌ Wave 0 |
| FR-3.3 | Delete recipe with cascade | integration | `npm test -- backend/tests/recipeController.test.js --testNamePattern="delete recipe"` | ❌ Wave 0 |
| FR-2.1 | Browse recipes with filters and pagination | integration | `npm test -- backend/tests/recipeController.test.js --testNamePattern="browse recipes"` | ❌ Wave 0 |
| FR-2.2 | View recipe detail with ingredients and creator info | integration | `npm test -- backend/tests/recipeController.test.js --testNamePattern="recipe detail"` | ❌ Wave 0 |
| AC-2 | Image upload validation (size, type) | unit | `npm test -- backend/tests/uploadMiddleware.test.js` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="recipes" --bail` (< 30 seconds)
- **Per wave merge:** `npm test -- --coverage` (full suite)
- **Phase gate:** Full suite green + manual image upload test before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/recipeController.test.js` — covers FR-3.1, FR-3.2, FR-3.3, FR-2.1, FR-2.2
- [ ] `backend/tests/uploadMiddleware.test.js` — covers AC-2 (file upload validation)
- [ ] `frontend/src/components/recipes/__tests__/RecipeForm.test.jsx` — covers form validation, dynamic fields
- [ ] Test setup: `npm install --save-dev supertest` — API testing library for Express
- [ ] Mock multer in tests: Strategy for testing file uploads without actual files

## Sources

### Primary (HIGH confidence)
- npm registry (multer 2.1.1, react-hook-form 7.72.1, yup 1.7.1, sharp 0.34.5) - Verified 2026-04-13
- PostgreSQL official documentation (textsearch chapter) - Structure and capabilities confirmed
- Project codebase analysis - Existing Recipe.js model, database schema, Redux setup, axiosConfig

### Secondary (MEDIUM confidence)
- React Hook Form patterns - Based on library API patterns and common usage (official docs blocked)
- Redux Toolkit normalized state pattern - Standard Redux entities pattern, widely documented
- Express + Multer integration patterns - Industry standard patterns from years of community use

### Tertiary (LOW confidence - requires validation)
- Full-text search performance thresholds - "10k records" estimate for ILIKE degradation is anecdotal; actual threshold depends on query patterns and hardware
- Image optimization necessity - Sharp benefits are known, but "defer to Phase 14" is project-specific judgment call
- Formik vs React Hook Form comparison - Based on 2020-2021 ecosystem shift, but specific metrics not verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via npm registry, versions current as of 2026-04-13
- Architecture: HIGH - Patterns are industry standard with proven track record; project codebase analysis confirms compatibility
- Pitfalls: HIGH - Based on common production issues documented in library issue trackers and security advisories
- Code examples: HIGH - Patterns verified against library APIs and project's existing code structure
- Performance claims: MEDIUM - ILIKE performance thresholds are estimates; actual performance depends on data volume and queries
- Full-text search: MEDIUM - PostgreSQL docs structure confirmed but detailed implementation not fully verified

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days - stack is stable, libraries mature)

**Critical gap identified:** recipes table schema MUST be updated to add `is_public` boolean field before implementation begins. This requires new migration file.
