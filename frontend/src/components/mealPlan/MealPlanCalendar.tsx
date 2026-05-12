import React from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { openRecipeModal, deleteMealPlan } from '../../redux/slices/mealPlanSlice';
import { getWeekDates, getDayName } from '../../utils/dateUtils';
import { MealPlan } from '../../types/models.types';
import './MealPlanCalendar.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
const MEAL_LABELS: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

interface MealPlanWithRecipe extends MealPlan {
  title?: string;
  image_url?: string;
}

interface MealPlanCalendarProps {
  mealPlans: MealPlanWithRecipe[];
  weekStartDate: Date | string;
}

const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({ mealPlans, weekStartDate }) => {
  const dispatch = useAppDispatch();
  const weekDates = getWeekDates(weekStartDate);

  // Helper: Find meal plan entry for specific day/meal
  const getMealPlan = (dayOfWeek: number, mealType: string): MealPlanWithRecipe | undefined => {
    return mealPlans.find(
      mp => mp.day_of_week === dayOfWeek && mp.meal_type === mealType
    );
  };

  // Handler: Open recipe selection modal
  const handleAddRecipe = (dayOfWeek: number, mealType: string): void => {
    dispatch(openRecipeModal({ day_of_week: dayOfWeek, meal_type: mealType }));
  };

  // Handler: Remove recipe from slot
  const handleRemoveRecipe = (mealPlanId: number): void => {
    if (window.confirm('Remove this recipe from your meal plan?')) {
      dispatch(deleteMealPlan(mealPlanId));
    }
  };

  return (
    <div className="meal-plan-calendar">
      <div className="calendar-grid">
        {/* Header Row: Day Names */}
        <div className="calendar-header">
          <div className="meal-type-column"></div>
          {weekDates.map((date, index) => (
            <div key={index} className="day-header">
              <div className="day-name">{getDayName(date)}</div>
              <div className="day-date">{date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Meal Rows: Breakfast, Lunch, Dinner */}
        {MEAL_TYPES.map(mealType => (
          <div key={mealType} className="meal-row">
            <div className="meal-type-label">{MEAL_LABELS[mealType]}</div>
            {weekDates.map((date, dayIndex) => {
              const dayOfWeek = date.getDay();
              const mealPlan = getMealPlan(dayOfWeek, mealType);

              return (
                <div key={dayIndex} className="meal-cell">
                  {mealPlan ? (
                    <div className="meal-card">
                      <img
                        src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${mealPlan.image_url}`}
                        alt={mealPlan.title}
                        className="meal-image"
                      />
                      <div className="meal-title">{mealPlan.title}</div>
                      <div className="meal-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleAddRecipe(dayOfWeek, mealType)}
                          title="Change recipe"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleRemoveRecipe(mealPlan.id)}
                          title="Remove recipe"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="add-recipe-btn"
                      onClick={() => handleAddRecipe(dayOfWeek, mealType)}
                    >
                      + Add Recipe
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanCalendar;
