import type { Currency, Rates } from './types';

export function fmt(n: number, currency: Currency, rates: Rates): string {
  const abs = Math.abs(n);
  if (currency === 'USD')
    return '$' + (abs / rates.USD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (currency === 'EUR')
    return '€' + (abs / rates.EUR).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '₦' + abs.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
