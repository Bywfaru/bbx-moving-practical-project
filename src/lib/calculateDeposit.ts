import { config } from '@/config/config';

export type CalculateDepositParams = {
  subtotal: number;
  weekendOrHolidaySurcharge?: number;
  depositPercentage?: number;
}

export const calculateDeposit = (params: CalculateDepositParams): number => {
  const { subtotal, weekendOrHolidaySurcharge = 0, depositPercentage = config.depositPercentage } = params;
  // Math.round rounds halves up, so $90.50 becomes $91
  return Math.round((subtotal + weekendOrHolidaySurcharge) * depositPercentage);
};
