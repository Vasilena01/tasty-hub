// Get Monday of current week (ISO week starts Monday)
export const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

// Format date as YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get next week's Monday
export const getNextWeek = (currentWeekStart) => {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() + 7);
  return formatDate(d);
};

// Get previous week's Monday
export const getPreviousWeek = (currentWeekStart) => {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() - 7);
  return formatDate(d);
};

// Format week display: "Week of April 7-13, 2026"
export const formatWeekDisplay = (weekStartDate) => {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const startMonth = monthNames[start.getMonth()];
  const endMonth = monthNames[end.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    return `Week of ${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `Week of ${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
};

// Get array of dates for the week (7 days starting Monday)
export const getWeekDates = (weekStartDate) => {
  const dates = [];
  const start = new Date(weekStartDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

// Get day name (Monday, Tuesday, etc.)
export const getDayName = (date) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[date.getDay()];
};
