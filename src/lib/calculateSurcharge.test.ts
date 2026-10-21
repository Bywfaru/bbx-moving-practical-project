import { describe, expect, it } from 'vitest';
import { config } from '@/config/config';
import { calculateSurcharge } from './calculateSurcharge';

describe('calculateSurcharge', () => {
  describe('on move dates that qualify for the surcharge', () => {
    it.each([
      ['a Saturday', '2026-10-24'],
      ['a Sunday', '2026-10-25'],
      ['Remembrance Day (weekday holiday)', '2026-11-11'],
      ['Christmas Day (weekday holiday)', '2026-12-25'],
    ])('returns only the configured surcharge amount on %s', (_label, moveDate) => {
      expect(calculateSurcharge({ subtotal: 1000, moveDate })).toBeCloseTo(1000 * config.weekendOrHolidaySurcharge);
    });

    it('scales with the subtotal', () => {
      expect(calculateSurcharge({ subtotal: 500, moveDate: '2026-10-24' })).toBeCloseTo(
        500 * config.weekendOrHolidaySurcharge,
      );
    });

    it('uses a custom surcharge rate', () => {
      expect(calculateSurcharge({ subtotal: 1000, moveDate: '2026-10-24', weekendOrHolidaySurcharge: 0.5 })).toBeCloseTo(
        500,
      );
    });

    it('returns 0 for a zero rate', () => {
      expect(calculateSurcharge({ subtotal: 1000, moveDate: '2026-10-24', weekendOrHolidaySurcharge: 0 })).toBe(0);
    });

    it('returns 0 for a zero subtotal', () => {
      expect(calculateSurcharge({ subtotal: 0, moveDate: '2026-10-24' })).toBe(0);
    });
  });

  describe('on move dates that do not qualify', () => {
    it.each([
      ['a regular Wednesday', '2026-10-21'],
      ['the Monday after a weekend', '2026-10-26'],
      ['the day before a holiday', '2026-11-10'],
      ['the day after a holiday', '2026-11-12'],
    ])('returns 0 on %s', (_label, moveDate) => {
      expect(calculateSurcharge({ subtotal: 1000, moveDate })).toBe(0);
    });

    it('returns 0 even with a custom rate', () => {
      expect(calculateSurcharge({ subtotal: 1000, moveDate: '2026-10-21', weekendOrHolidaySurcharge: 0.5 })).toBe(0);
    });
  });
});
