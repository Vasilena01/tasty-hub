import React, { useState, FormEvent, ChangeEvent, MouseEvent } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { addManualItem, closeAddModal } from '../../redux/slices/shoppingListSlice';
import './AddItemModal.css';

interface AddItemModalProps {
  currentWeek: string | null;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ currentWeek }) => {
  const dispatch = useAppDispatch();
  const [ingredientName, setIngredientName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!ingredientName.trim() || !quantity.trim()) {
      alert('Please fill in ingredient name and quantity');
      return;
    }

    if (!currentWeek) {
      alert('No week selected');
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

  const handleClose = (): void => {
    dispatch(closeAddModal());
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIngredientName(e.target.value)}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)}
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
