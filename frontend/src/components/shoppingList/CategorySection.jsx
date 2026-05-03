import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ShoppingListItem from './ShoppingListItem';
import './CategorySection.css';

const CategorySection = ({ category, items }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Vegetables': '🥬',
      'Proteins': '🍖',
      'Dairy': '🥛',
      'Grains': '🌾',
      'Fruits': '🍎',
      'Spices': '🌶️',
      'Oils': '🫒',
      'Condiments': '🍯',
      'Beverages': '🥤',
      'Other': '📦'
    };
    return emojiMap[category] || '📦';
  };

  // Count checked items in this category
  const checkedCount = items.filter(item => item.is_checked).length;
  const totalCount = items.length;

  return (
    <div className="category-section">
      <div className="category-header" onClick={toggleExpanded}>
        <div className="category-title">
          <span className="category-emoji">{getCategoryEmoji(category)}</span>
          <h3>{category}</h3>
          <span className="item-count">
            ({checkedCount}/{totalCount})
          </span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="category-items">
          {items.map(item => (
            <ShoppingListItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
