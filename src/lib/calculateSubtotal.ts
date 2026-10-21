import { config } from '@/config/config';

export type CalculateSubtotalParams = {
  bedrooms: number;
  distance: number;
  baseFee?: number;
  bedroomCharge?: number;
  distanceCharge?: number;
}

export const calculateSubtotal = (params: CalculateSubtotalParams): number => {
  const {
    bedrooms,
    distance,
    baseFee = config.baseFee,
    bedroomCharge = config.pricePerBedroom,
    distanceCharge = config.pricePerKm,
  } = params;
  return baseFee + (bedroomCharge * bedrooms) + (distanceCharge * distance);
};
