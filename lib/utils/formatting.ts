/**
 * Formatting Utilities
 * Functions for formatting values for display
 */

/**
 * Format a number as currency ($X.XX)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a probability as a percentage
 * @param probability - The probability value (0-1)
 * @returns Formatted percentage string or 'N/A' if undefined
 */
export function formatProbability(probability: number | undefined): string {
  if (probability === undefined) return 'N/A';
  return `${(probability * 100).toFixed(2)}%`;
}

/**
 * Format a probability as odds (1 in X)
 * @param probability - The probability value (0-1)
 * @returns Formatted odds string or 'N/A' if undefined or zero
 */
export function formatProbabilityAsOdds(probability: number | undefined): string {
  if (probability === undefined || probability === 0) return 'N/A';
  const odds = Math.round(1 / probability);
  return `1 in ${odds.toLocaleString()}`;
}

/**
 * Format a large number with thousands separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number): string {
  return value.toLocaleString();
}
