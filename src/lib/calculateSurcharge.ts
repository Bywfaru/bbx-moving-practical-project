import { isWeekend, parse } from 'date-fns';
import { bcStatHolidays, config } from '@/config/config';

export type CalculateSurchargeParams = {
  subtotal: number;
  moveDate: string;
  weekendOrHolidaySurcharge?: number;
};

export const calculateSurcharge = (params: CalculateSurchargeParams): number => {
  const {
    subtotal,
    moveDate,
    weekendOrHolidaySurcharge = config.weekendOrHolidaySurcharge,
  } = params;

  const date = parse(moveDate, config.dateFormat, new Date());

  if (isWeekend(date) || bcStatHolidays.includes(moveDate)) return subtotal * weekendOrHolidaySurcharge;

  return 0;
};
