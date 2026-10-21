export const config = {
  baseFee: 150,
  /**
   * $100 per bedroom. "4+" counts as 4 bedrooms ($400)
   */
  pricePerBedroom: 100,
  /**
   * $2.50 per km. Decimals are allowed (e.g. 12.5). The distance must be more than 0 km and no more than 500 km; we do
   * not serve moves over 500 km.
   */
  pricePerKm: 2.5,
  minDistance: 0,
  maxDistance: 500,
  /**
   * 20% surcharge for moves on weekends or statutory holidays. The surcharge is applied at most once: a holiday that
   * falls on a weekend still gets 20%, not 40%.
   */
  weekendOrHolidaySurcharge: 0.2,
  timezone: 'America/Vancouver',
  /**
   * 25% of the final quote (after any surcharge), rounded to the nearest whole dollar. Halves round up, so $90.50
   * becomes $91.
   */
  depositPercentage: 0.25,
  dateFormat: 'yyyy-MM-dd',
};

export const bcStatHolidays = [
  '2026-11-11', // Remembrance Day
  '2026-12-25', // Christmas Day
  '2027-01-01', // New Year's Day
  '2027-02-15', // Family Day
  '2027-03-26', // Good Friday
];
