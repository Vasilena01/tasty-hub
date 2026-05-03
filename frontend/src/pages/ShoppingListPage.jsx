import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchShoppingList,
  generateShoppingList,
  setCurrentWeek,
  clearCheckedItems,
  deleteShoppingList,
  clearError,
  clearSuccessMessage,
  openAddModal,
  selectShoppingListByCategory,
  selectCheckedCount,
  selectTotalCount
} from '../redux/slices/shoppingListSlice';
import {
  getWeekStartDate,
  getNextWeek,
  getPreviousWeek,
  formatWeekDisplay
} from '../utils/dateUtils';
import CategorySection from '../components/shoppingList/CategorySection';
import AddItemModal from '../components/shoppingList/AddItemModal';
import './ShoppingListPage.css';

const ShoppingListPage = () => {
  const dispatch = useDispatch();
  const { currentWeek, loading, generating, error, successMessage, addModalOpen } = useSelector((state) => state.shoppingList);
  const itemsByCategory = useSelector(selectShoppingListByCategory);
  const checkedCount = useSelector(selectCheckedCount);
  const totalCount = useSelector(selectTotalCount);

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Initialize with current week
  useEffect(() => {
    const weekStart = getWeekStartDate();
    dispatch(setCurrentWeek(weekStart));
    dispatch(fetchShoppingList(weekStart));
  }, [dispatch]);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleWeekChange = (direction) => {
    const newWeek = direction === 'next' ? getNextWeek(currentWeek) : getPreviousWeek(currentWeek);
    dispatch(setCurrentWeek(newWeek));
    dispatch(fetchShoppingList(newWeek));
  };

  const handleGenerate = () => {
    dispatch(generateShoppingList(currentWeek));
  };

  const handleClearChecked = () => {
    if (checkedCount === 0) {
      alert('No checked items to clear');
      return;
    }
    if (window.confirm(`Clear ${checkedCount} checked item(s)?`)) {
      dispatch(clearCheckedItems(currentWeek));
    }
  };

  const handleRegenerateConfirm = () => {
    dispatch(deleteShoppingList(currentWeek)).then(() => {
      dispatch(generateShoppingList(currentWeek));
      setShowRegenerateConfirm(false);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Category order
  const categoryOrder = ['Vegetables', 'Proteins', 'Dairy', 'Grains', 'Fruits', 'Spices', 'Oils', 'Condiments', 'Beverages', 'Other'];
  const sortedCategories = categoryOrder.filter(cat => itemsByCategory[cat] && itemsByCategory[cat].length > 0);

  return (
    <div className="shopping-list-page">
      <div className="page-header">
        <h1>Shopping List</h1>
        <p>Smart shopping list from your weekly meal plan</p>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button onClick={() => handleWeekChange('prev')} className="btn-secondary">
          ← Previous Week
        </button>
        <h2>{currentWeek ? formatWeekDisplay(currentWeek) : 'Loading...'}</h2>
        <button onClick={() => handleWeekChange('next')} className="btn-secondary">
          Next Week →
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Generating...' : totalCount > 0 ? 'Regenerate List' : 'Generate Shopping List'}
        </button>
        <button onClick={() => dispatch(openAddModal())} className="btn-secondary">
          + Add Manual Item
        </button>
        <button onClick={handleClearChecked} disabled={checkedCount === 0} className="btn-secondary">
          Clear Checked ({checkedCount})
        </button>
        <button onClick={handlePrint} className="btn-secondary print-only-hide">
          🖨 Print List
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="message success-message">
          {successMessage}
        </div>
      )}

      {/* Progress */}
      {totalCount > 0 && (
        <div className="progress-section">
          <div className="progress-text">
            {checkedCount} of {totalCount} items purchased
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Shopping List Content */}
      <div className="shopping-list-content">
        {loading && <div className="loading">Loading shopping list...</div>}

        {!loading && totalCount === 0 && (
          <div className="empty-state">
            <h3>No shopping list for this week</h3>
            <p>Generate a shopping list from your meal plan to get started.</p>
          </div>
        )}

        {!loading && totalCount > 0 && sortedCategories.map(category => (
          <CategorySection
            key={category}
            category={category}
            items={itemsByCategory[category]}
            currentWeek={currentWeek}
          />
        ))}
      </div>

      {/* Add Item Modal */}
      {addModalOpen && <AddItemModal currentWeek={currentWeek} />}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="modal-overlay" onClick={() => setShowRegenerateConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Regenerate Shopping List?</h3>
            <p>This will delete all current items (including manual additions) and generate a fresh list from your meal plan.</p>
            <div className="modal-actions">
              <button onClick={handleRegenerateConfirm} className="btn-primary">
                Regenerate
              </button>
              <button onClick={() => setShowRegenerateConfirm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListPage;
