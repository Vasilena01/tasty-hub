import React, { useState, ChangeEvent } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { toggleItemChecked, updateItem, deleteItem } from '../../redux/slices/shoppingListSlice';
import { ShoppingListItem as ShoppingListItemType } from '../../types/models.types';
import './ShoppingListItem.css';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(item.ingredient_name);
  const [editedQuantity, setEditedQuantity] = useState<number>(item.quantity);
  const [editedUnit, setEditedUnit] = useState<string>(item.unit);

  const handleToggle = (): void => {
    dispatch(toggleItemChecked(item.id));
  };

  const handleSaveEdit = (): void => {
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

  const handleCancelEdit = (): void => {
    setEditedName(item.ingredient_name);
    setEditedQuantity(item.quantity);
    setEditedUnit(item.unit);
    setIsEditing(false);
  };

  const handleDelete = (): void => {
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedName(e.target.value)}
          className="edit-input name-input"
          placeholder="Ingredient name"
        />
        <input
          type="text"
          value={editedQuantity}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedQuantity(Number(e.target.value))}
          className="edit-input quantity-input"
          placeholder="Qty"
        />
        <input
          type="text"
          value={editedUnit}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedUnit(e.target.value)}
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
