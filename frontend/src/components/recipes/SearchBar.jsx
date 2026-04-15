import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, selectBrowseFilters } from '../../redux/slices/recipeSlice';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = 'Search recipes...' }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectBrowseFilters);
  const [searchText, setSearchText] = useState(filters.search || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchText }));
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleClear = () => {
    setSearchText('');
    dispatch(setFilters({ search: '' }));
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchText && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className="search-submit-btn">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
