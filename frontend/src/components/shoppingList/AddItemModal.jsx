import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addManualItem, closeAddModal } from '../../redux/slices/shoppingListSlice';
import './AddItemModal.css';

const AddItemModal = ({ currentWeek }) => {
  const dispatch = useDispatch();
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ingredientName.trim() || !quantity.trim()) {
      alert('Please fill in ingredient name and quantity');
      return;
    }

    dispatch(addManualItem({
      ingredient_name: ingredientName.trim(),
      quantity: quantity.trim(),
      unit: unit.trim(),
      week_start_date: currentWeek
    }));

    // Reset form
    setIngredientName('');
    setQuantity('');
    setUnit('');
  };

  const handleClose = () => {
    dispatch(closeAddModal());
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-item-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Manual Item</h3>
        <p>Add an item that's not in your meal plan</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ingredient-name">Ingredient Name *</label>
            <input
              type="text"
              id="ingredient-name"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              placeholder="e.g., Bananas"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="text"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., pieces"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              Add Item
            </button>
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
