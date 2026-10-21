import { isMatch } from 'date-fns';
import { config } from '@/config/config';
import z from 'zod';
import { TZDate } from '@date-fns/tz';

const NAME_MAX_LENGTH = 255;

export const movingQuoteFormSchema = z.object({
  numBedrooms: z.int().min(1).max(4),
  moveDistanceKm: z.coerce.number<number>().superRefine((arg, ctx) => {
    if (arg <= config.minDistance) return ctx.addIssue(`The move distance must be greater than ${config.minDistance} km.`);
    if (arg > config.maxDistance) return ctx.addIssue(`The move distance must be no more than ${config.maxDistance} km.`);
  }),
  moveDate: z.string().nonempty('Move date is required').superRefine((arg, ctx) => {
    if (!isMatch(arg, config.dateFormat)) {
      return ctx.addIssue(
        'Move date must match yyyy-MM-dd format (e.g. 1970-01-01).');
    }
    if (new Date() >= new TZDate(`${arg} 00:00`, config.timezone)) {
      return ctx.addIssue(
        'Move date must be a future date.');
    }
  }),
  customerName: z.string().nonempty('Name cannot be empty').max(NAME_MAX_LENGTH),
  customerEmail: z.email(),
});

export type MovingQuoteFormSchema = z.infer<typeof movingQuoteFormSchema>;
