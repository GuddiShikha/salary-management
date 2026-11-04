import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, formatNumber } from './format';

describe('formatMoney', () => {
  it('formats in the given currency without decimals', () => {
    expect(formatMoney(123456.78, 'USD')).toBe('$123,457');
  });

  it('supports compact notation', () => {
    expect(formatMoney(2_500_000, 'INR', { compact: true })).toBe('₹2.5M');
  });

  it('renders a dash for missing values', () => {
    expect(formatMoney(null, 'EUR')).toBe('—');
  });
});

describe('formatNumber / formatDate', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(10000)).toBe('10,000');
  });

  it('formats ISO dates without timezone drift', () => {
    expect(formatDate('2024-01-01')).toBe('01 Jan 2024');
  });
});
