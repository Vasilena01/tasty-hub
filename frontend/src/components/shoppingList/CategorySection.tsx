import React, { useState } from 'react';
import ShoppingListItem from './ShoppingListItem';
import { ShoppingListItem as ShoppingListItemType } from '../../types/models.types';
import './CategorySection.css';

interface CategorySectionProps {
  category: string;
  items: ShoppingListItemType[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, items }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded);
  };

  // Get category emoji
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
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
