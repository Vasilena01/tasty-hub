import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFilters, selectBrowseFilters } from '../../redux/slices/recipeSlice';
import './SearchBar.css';

interface SearchBarProps {
  onSearch?: (searchText: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search recipes...'
}) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBrowseFilters);
  const [searchText, setSearchText] = useState<string>(filters.search || '');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    dispatch(setFilters({ search: searchText }));
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleClear = (): void => {
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
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
};

export default SearchBar;
