/**
 * Currency utility functions for Indian Rupees (INR)
 */

/**
 * Format amount to Indian Rupees currency
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // No decimals for cleaner display
  }).format(numAmount);
}

/**
 * Format amount with compact notation for large numbers
 */
export function formatCurrencyCompact(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numAmount);
}

/**
 * Convert USD pricing to realistic INR pricing
 * Uses approximate conversion rate and adjusts for Indian market
 */
export function convertUSDToINR(usdAmount: number | string): number {
  const usdNum = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  
  // Use a conversion rate that makes sense for Indian tour pricing
  // Typical range: $2000 tour -> ₹80,000-120,000 range
  const conversionRate = 75; // Conservative rate for better pricing
  
  return Math.round(usdNum * conversionRate);
}

/**
 * Get currency symbol for INR
 */
export const CURRENCY_SYMBOL = '₹';

/**
 * Get currency code
 */
export const CURRENCY_CODE = 'INR';