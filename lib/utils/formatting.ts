/**
 * Formatting Utility Functions
 * Contains utilities for formatting currencies, percentages, and other values
 */

/**
 * Format a number as a currency string
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as a percentage
 * @param probability - The probability value (0-1)
 * @returns Formatted percentage string
 */
export const formatProbability = (probability?: number): string => {
  if (probability === undefined) return 'N/A';
  
  return `${(probability * 100).toFixed(2)}%`;
};

/**
 * Format a probability as odds (1 in X)
 * @param probability - The probability value (0-1)
 * @returns Formatted odds string
 */
export const formatProbabilityAsOdds = (probability?: number): string => {
  if (!probability || probability <= 0) return 'N/A';
  
  const odds = Math.round(1 / probability);
  return `1 in ${odds.toLocaleString()}`;
};

/**
 * Get CSS class based on profit value
 * @param value - The profit value
 * @returns CSS class name
 */
export const getProfitClass = (value: number): string => {
  return value >= 0 ? 'profit' : 'loss';
};
