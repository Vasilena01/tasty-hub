/**
 * Helper utilities for extracting typed parameters from Express requests
 */

/**
 * Extract string from req.params which can be string | string[]
 */
export const getParamAsString = (param: string | string[] | undefined): string => {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
};

/**
 * Extract number from req.params
 */
export const getParamAsNumber = (param: string | string[] | undefined): number => {
  const str = getParamAsString(param);
  return parseInt(str, 10);
};

/**
 * Convert string date to Date object with validation
 */
export const parseDateParam = (dateStr: string): Date => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date;
};
