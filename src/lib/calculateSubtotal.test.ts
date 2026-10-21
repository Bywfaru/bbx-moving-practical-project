import { describe, expect, it } from 'vitest';
import { config } from '@/config/config';
import { calculateSubtotal } from './calculateSubtotal';

describe('calculateSubtotal', () => {
  it('sums base fee, bedroom charge, and distance charge', () => {
    expect(
      calculateSubtotal({
        bedrooms: 2,
        distance: 10,
        baseFee: 100,
        bedroomCharge: 50,
        distanceCharge: 3,
      }),
    ).toBe(100 + 50 * 2 + 3 * 10);
  });

  it('defaults baseFee, bedroomCharge, and distanceCharge to the configured prices', () => {
    expect(calculateSubtotal({ bedrooms: 3, distance: 25 })).toBe(
      config.baseFee + config.pricePerBedroom * 3 + config.pricePerKm * 25,
    );
  });

  it('overrides only the base fee, keeping the configured bedroom and distance prices', () => {
    expect(calculateSubtotal({ bedrooms: 3, distance: 25, baseFee: 200 })).toBe(
      200 + config.pricePerBedroom * 3 + config.pricePerKm * 25,
    );
  });

  it('overrides only the bedroom charge, keeping the configured base fee and distance price', () => {
    expect(calculateSubtotal({ bedrooms: 4, distance: 25, bedroomCharge: 40 })).toBe(
      config.baseFee + 40 * 4 + config.pricePerKm * 25,
    );
  });

  it('overrides only the distance charge, keeping the configured base fee and bedroom price', () => {
    expect(calculateSubtotal({ bedrooms: 4, distance: 25, distanceCharge: 2 })).toBe(
      config.baseFee + config.pricePerBedroom * 4 + 2 * 25,
    );
  });

  it('allows an explicit zero to override a configured default', () => {
    expect(calculateSubtotal({ bedrooms: 4, distance: 25, baseFee: 0, bedroomCharge: 0, distanceCharge: 0 })).toBe(0);
  });

  it('returns the base fee when bedrooms and distance are zero', () => {
    expect(
      calculateSubtotal({
        bedrooms: 0,
        distance: 0,
        baseFee: 80,
        bedroomCharge: 50,
        distanceCharge: 3,
      }),
    ).toBe(80);
  });

  it('handles fractional distances', () => {
    expect(
      calculateSubtotal({ bedrooms: 1, distance: 2.5, baseFee: 10, bedroomCharge: 5, distanceCharge: 4 }),
    ).toBe(25);
  });
});
