import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency based on the currency code
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }

  const locale = getLocaleForCurrency(currency);
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  };

  if (options?.showSymbol === false) {
    // If we don't want the symbol, format as number and add currency code
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: formatOptions.minimumFractionDigits,
      maximumFractionDigits: formatOptions.maximumFractionDigits,
    });
    return `${formatter.format(numAmount)} ${currency}`;
  }

  return new Intl.NumberFormat(locale, formatOptions).format(numAmount);
}

/**
 * Get the appropriate locale for a currency code
 */
function getLocaleForCurrency(currency: string): string {
  const currencyLocaleMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE', // or 'fr-FR', 'es-ES' depending on preference
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'AUD': 'en-AU',
    'CAD': 'en-CA',
    'CHF': 'de-CH',
    'HKD': 'zh-HK',
    'SGD': 'en-SG',
  };

  return currencyLocaleMap[currency] || 'en-US';
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'HKD': 'HK$',
    'SGD': 'S$',
  };

  return symbols[currency] || '$';
}