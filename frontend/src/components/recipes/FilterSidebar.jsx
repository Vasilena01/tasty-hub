import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, selectBrowseFilters } from '../../redux/slices/recipeSlice';
import './FilterSidebar.css';

function FilterSidebar({ onFilterChange }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectBrowseFilters);

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
    if (onFilterChange) {
      onFilterChange({ ...filters, [filterName]: value });
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    if (onFilterChange) {
      onFilterChange({ category: '', difficulty: '', minRating: '', search: '', sortBy: 'newest', source: 'all' });
    }
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button
          type="button"
          className="clear-filters-btn"
          onClick={handleClearFilters}
        >
          Clear All
        </button>
      </div>

      {/* Source Filter */}
      <div className="filter-group">
        <label htmlFor="source-filter">Recipe Source</label>
        <select
          id="source-filter"
          value={filters.source || 'all'}
          onChange={(e) => handleFilterChange('source', e.target.value)}
        >
          <option value="all">All Recipes</option>
          <option value="following">Following</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
        </select>
      </div>

      {/* Difficulty Filter */}
      <div className="filter-group">
        <label htmlFor="difficulty-filter">Difficulty</label>
        <select
          id="difficulty-filter"
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="filter-group">
        <label htmlFor="rating-filter">Minimum Rating</label>
        <select
          id="rating-filter"
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Star</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="filter-group">
        <label htmlFor="sort-filter">Sort By</label>
        <select
          id="sort-filter"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="quickest">Quickest</option>
        </select>
      </div>
    </aside>
  );
}

export default FilterSidebar;
