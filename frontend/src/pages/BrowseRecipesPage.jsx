import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecipes,
  searchRecipesByIngredients,
  setFilters,
  selectAllRecipes,
  selectRecipeLoading,
  selectRecipeError,
  selectBrowseFilters,
  selectBrowsePagination
} from '../redux/slices/recipeSlice';
import { RecipeGrid, FilterSidebar, SearchBar, Pagination } from '../components/recipes';
import './BrowseRecipesPage.css';

function BrowseRecipesPage() {
  const dispatch = useDispatch();
  const recipes = useSelector(selectAllRecipes);
  const loading = useSelector(selectRecipeLoading);
  const error = useSelector(selectRecipeError);
  const filters = useSelector(selectBrowseFilters);
  const pagination = useSelector(selectBrowsePagination);

  // Fetch recipes when filters or page changes
  useEffect(() => {
    // If ingredient search is active, use ingredient search endpoint
    if (filters.ingredientSearch && filters.ingredientSearch.trim()) {
      dispatch(searchRecipesByIngredients({
        ingredients: filters.ingredientSearch,
        category: filters.category,
        difficulty: filters.difficulty,
        minRating: filters.minRating,
        page: pagination.page,
        limit: pagination.limit
      }));
    } else {
      // Otherwise use regular search
      dispatch(fetchRecipes({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }));
    }
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Handle filter changes - reset to page 1
  const handleFilterChange = useCallback((newFilters) => {
    dispatch(setFilters({ ...newFilters }));
    // Pagination will reset when filters change via fetchRecipes
  }, [dispatch]);

  // Handle recipe name search
  const handleSearch = useCallback((searchText) => {
    dispatch(setFilters({ search: searchText }));
  }, [dispatch]);

  // Handle ingredient search
  const handleIngredientSearch = useCallback((ingredientText) => {
    dispatch(setFilters({ ingredientSearch: ingredientText }));
  }, [dispatch]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    // If ingredient search is active, use ingredient search endpoint
    if (filters.ingredientSearch && filters.ingredientSearch.trim()) {
      dispatch(searchRecipesByIngredients({
        ingredients: filters.ingredientSearch,
        category: filters.category,
        difficulty: filters.difficulty,
        minRating: filters.minRating,
        page: newPage,
        limit: pagination.limit
      }));
    } else {
      dispatch(fetchRecipes({
        ...filters,
        page: newPage,
        limit: pagination.limit
      }));
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, filters, pagination.limit]);

  return (
    <div className="browse-recipes-page">
      <div className="browse-header">
        <h1>Discover Recipes</h1>
        <p>Find your next favorite dish from our collection</p>
      </div>

      <div className="browse-search-section">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by title or description..."
        />
        <SearchBar
          onSearch={handleIngredientSearch}
          placeholder="Search by ingredients (e.g., chicken, rice, tomatoes)..."
        />
      </div>

      <div className="browse-content">
        <aside className="browse-sidebar">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </aside>

        <main className="browse-main">
          {error && (
            <div className="browse-error">
              <p>Error loading recipes: {error}</p>
              <button
                onClick={() => dispatch(fetchRecipes(filters))}
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="browse-results-header">
            <span className="results-count">
              {pagination.total} recipe{pagination.total !== 1 ? 's' : ''} found
            </span>
          </div>

          <RecipeGrid
            recipes={recipes}
            loading={loading}
            emptyMessage={
              filters.search || filters.ingredientSearch || filters.category || filters.difficulty || filters.minRating
                ? "No recipes match your filters. Try adjusting your search criteria."
                : "No recipes available yet. Be the first to share a recipe!"
            }
            showIngredients={filters.ingredientSearch && filters.ingredientSearch.trim()}
          />

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
}

export default BrowseRecipesPage;
