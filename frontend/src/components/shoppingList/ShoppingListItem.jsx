import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleItemChecked, updateItem, deleteItem } from '../../redux/slices/shoppingListSlice';
import './ShoppingListItem.css';

const ShoppingListItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.ingredient_name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedUnit, setEditedUnit] = useState(item.unit);

  const handleToggle = () => {
    dispatch(toggleItemChecked(item.id));
  };

  const handleSaveEdit = () => {
    dispatch(updateItem({
      itemId: item.id,
      updates: {
        ingredient_name: editedName,
        quantity: editedQuantity,
        unit: editedUnit
      }
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(item.ingredient_name);
    setEditedQuantity(item.quantity);
    setEditedUnit(item.unit);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${item.ingredient_name}?`)) {
      dispatch(deleteItem(item.id));
    }
  };

  if (isEditing) {
    return (
      <div className="shopping-list-item editing">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="edit-input name-input"
          placeholder="Ingredient name"
        />
        <input
          type="text"
          value={editedQuantity}
          onChange={(e) => setEditedQuantity(e.target.value)}
          className="edit-input quantity-input"
          placeholder="Qty"
        />
        <input
          type="text"
          value={editedUnit}
          onChange={(e) => setEditedUnit(e.target.value)}
          className="edit-input unit-input"
          placeholder="Unit"
        />
        <div className="edit-actions">
          <button onClick={handleSaveEdit} className="save-btn" title="Save">
            ✓
          </button>
          <button onClick={handleCancelEdit} className="cancel-btn" title="Cancel">
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`shopping-list-item ${item.is_checked ? 'checked' : ''}`}>
      <input
        type="checkbox"
        checked={item.is_checked}
        onChange={handleToggle}
        className="item-checkbox"
      />
      <div className="item-details">
        <span className="item-name">
          {item.ingredient_name}
        </span>
        <span className="item-quantity">
          {item.quantity} {item.unit}
        </span>
      </div>
      <div className="item-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="edit-icon-btn"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="delete-icon-btn"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ShoppingListItem;
