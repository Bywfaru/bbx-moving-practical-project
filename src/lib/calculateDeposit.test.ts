import { describe, expect, it } from 'vitest';
import { config } from '@/config/config';
import { calculateDeposit } from './calculateDeposit';

describe('calculateDeposit', () => {
  it('applies the configured deposit percentage to the subtotal by default', () => {
    expect(calculateDeposit({ subtotal: 1000 })).toBeCloseTo(1000 * config.depositPercentage);
  });

  it('adds the weekend or holiday surcharge before applying the percentage', () => {
    expect(calculateDeposit({ subtotal: 1000, weekendOrHolidaySurcharge: 200 })).toBeCloseTo(
      (1000 + 200) * config.depositPercentage,
    );
  });

  it('uses a custom deposit percentage', () => {
    expect(calculateDeposit({ subtotal: 1000, depositPercentage: 0.5 })).toBeCloseTo(500);
  });

  it('combines a surcharge with a custom deposit percentage', () => {
    expect(calculateDeposit({ subtotal: 800, weekendOrHolidaySurcharge: 200, depositPercentage: 0.1 })).toBeCloseTo(100);
  });

  it('treats an omitted surcharge as zero', () => {
    expect(calculateDeposit({ subtotal: 400, depositPercentage: 0.25 })).toBeCloseTo(
      calculateDeposit({ subtotal: 400, weekendOrHolidaySurcharge: 0, depositPercentage: 0.25 }),
    );
  });

  it('returns 0 for a zero subtotal and no surcharge', () => {
    expect(calculateDeposit({ subtotal: 0 })).toBe(0);
  });

  it('returns 0 for a zero deposit percentage', () => {
    expect(calculateDeposit({ subtotal: 1000, depositPercentage: 0 })).toBe(0);
  });

  it('allows an explicit zero percentage to override the configured default', () => {
    expect(calculateDeposit({ subtotal: 1000, weekendOrHolidaySurcharge: 200, depositPercentage: 0 })).toBe(0);
  });

  it('returns the full amount for a 100% deposit', () => {
    expect(calculateDeposit({ subtotal: 1000, weekendOrHolidaySurcharge: 200, depositPercentage: 1 })).toBeCloseTo(1200);
  });

  describe('rounding to a whole dollar', () => {
    it.each([
      ['rounds halves up', 362, 91], // 90.50
      ['rounds down below the half', 361, 90], // 90.25
      ['rounds up above the half', 363, 91], // 90.75
      ['keeps whole amounts as-is', 400, 100],
    ])('%s', (_label, subtotal, expected) => {
      expect(calculateDeposit({ subtotal, depositPercentage: 0.25 })).toBe(expected);
    });

    it('rounds after the surcharge is added', () => {
      expect(calculateDeposit({ subtotal: 300, weekendOrHolidaySurcharge: 62, depositPercentage: 0.25 })).toBe(91);
    });
  });
});
