import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMealPlanForWeek, setCurrentWeek } from '../redux/slices/mealPlanSlice';
import { getWeekStartDate, getNextWeek, getPreviousWeek, formatWeekDisplay } from '../utils/dateUtils';
import MealPlanCalendar from '../components/mealPlan/MealPlanCalendar';
import RecipeSelectionModal from '../components/mealPlan/RecipeSelectionModal';
import './MealPlannerPage.css';

const MealPlannerPage = () => {
  const dispatch = useDispatch();
  const { mealPlans, currentWeek, loading, error, modalOpen, selectedSlot } = useSelector(state => state.mealPlan);

  useEffect(() => {
    // Initialize to current week on mount
    const thisWeek = getWeekStartDate();
    dispatch(setCurrentWeek(thisWeek));
    dispatch(fetchMealPlanForWeek(thisWeek));
  }, [dispatch]);

  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeek(currentWeek);
    dispatch(setCurrentWeek(prevWeek));
    dispatch(fetchMealPlanForWeek(prevWeek));
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(currentWeek);
    dispatch(setCurrentWeek(nextWeek));
    dispatch(fetchMealPlanForWeek(nextWeek));
  };

  if (loading && !currentWeek) {
    return <div className="loading">Loading meal plan...</div>;
  }

  return (
    <div className="meal-planner-page">
      <div className="page-header">
        <h1>Meal Planner</h1>
        <p className="subtitle">Plan your weekly meals</p>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="nav-btn" onClick={handlePreviousWeek}>
          ← Previous Week
        </button>
        <div className="current-week">
          {currentWeek && formatWeekDisplay(currentWeek)}
        </div>
        <button className="nav-btn" onClick={handleNextWeek}>
          Next Week →
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Calendar */}
      {currentWeek && (
        <MealPlanCalendar
          mealPlans={mealPlans}
          weekStartDate={currentWeek}
        />
      )}

      {/* Recipe Selection Modal */}
      <RecipeSelectionModal
        isOpen={modalOpen}
        selectedSlot={selectedSlot}
        currentWeek={currentWeek}
      />
    </div>
  );
};

export default MealPlannerPage;
