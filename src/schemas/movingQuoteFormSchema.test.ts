import { describe, expect, it } from 'vitest';
import { config } from '@/config/config';
import { movingQuoteFormSchema } from './movingQuoteFormSchema';

const validInput = {
  numBedrooms: 2,
  moveDistanceKm: 10,
  moveDate: '2099-01-01',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
};

const parseDistance = (moveDistanceKm: unknown) =>
  movingQuoteFormSchema.safeParse({ ...validInput, moveDistanceKm });

describe('movingQuoteFormSchema moveDistanceKm', () => {
  it.each([0.1, 12.5, 250, config.maxDistance])('accepts %s km', (distance) => {
    expect(parseDistance(distance).success).toBe(true);
  });

  it.each([0, '0', '', -1, config.maxDistance + 0.1, config.maxDistance + 1])('rejects %s km', (distance) => {
    expect(parseDistance(distance).success).toBe(false);
  });

  it('says the distance must be greater than 0 for zero', () => {
    const res = parseDistance(0);

    expect(res.success ? '' : res.error.message).toContain('greater than 0');
  });

  it('says the distance must be no more than the maximum when too large', () => {
    const res = parseDistance(config.maxDistance + 1);

    expect(res.success ? '' : res.error.message).toContain(`no more than ${config.maxDistance}`);
  });
});
