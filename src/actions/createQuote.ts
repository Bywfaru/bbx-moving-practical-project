'use server';

import { MovingQuoteFormSchema, movingQuoteFormSchema } from '@/schemas/movingQuoteFormSchema';
import { calculateSubtotal } from '@/lib/calculateSubtotal';
import { calculateSurcharge } from '@/lib/calculateSurcharge';
import { calculateDeposit } from '@/lib/calculateDeposit';
import { createClient } from '@/lib/supabase/server';
import { config } from '@/config/config';
import { createHash } from 'node:crypto';

/**
 * Postgres SQLSTATE for unique_violation. The idempotency key is unique, so this means the same request was already
 * saved.
 */
const UNIQUE_VIOLATION_CODE = '23505';

export type CreateQuoteReturn = {
  success: boolean;
  message: string;
  data: {
    customerName: string;
    moveDate: string;
    subtotal: number;
    surcharge: number;
    total: number;
    deposit: number;
  } | null;
}

export const createQuote = async (params: MovingQuoteFormSchema): Promise<CreateQuoteReturn> => {
  const parsedData = movingQuoteFormSchema.safeParse(params);

  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.message,
      data: null,
    };
  }
  const { customerName, customerEmail, moveDistanceKm, moveDate, numBedrooms } = parsedData.data;

  const idempotencyKey = createHash('sha256').update(JSON.stringify(parsedData.data)).digest('hex');
  const subtotal = calculateSubtotal({ distance: moveDistanceKm, bedrooms: numBedrooms });
  const surcharge = calculateSurcharge({ subtotal, moveDate });
  const total = subtotal + surcharge;
  const deposit = calculateDeposit({ subtotal, weekendOrHolidaySurcharge: surcharge });

  try {
    const supabase = createClient();

    const insertRes = await supabase.from('bookings').insert({
      subtotal,
      deposit,
      total,
      base_fee: config.baseFee,
      bedrooms: numBedrooms,
      distance: moveDistanceKm,
      weekend_holiday_surcharge: surcharge,
      idempotency_key: idempotencyKey,
      move_date: moveDate,
      customer_name: customerName,
      customer_email: customerEmail,
    });

    if (!insertRes.success) {
      if (insertRes.error.code === UNIQUE_VIOLATION_CODE) {
        const existingRes = await supabase
          .from('bookings')
          .select('subtotal, weekend_holiday_surcharge, deposit, total')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (!existingRes.success) {
          return {
            success: false,
            message: `Failed to retrieve your existing quote: ${existingRes.error.message}`,
            data: null,
          };
        }

        return {
          success: true,
          message: 'You have already submitted this quote request. Here is your existing quote.',
          data: {
            customerName,
            moveDate,
            subtotal: existingRes.data.subtotal,
            surcharge: existingRes.data.weekend_holiday_surcharge,
            deposit: existingRes.data.deposit,
            total: existingRes.data.total,
          },
        };
      }

      return {
        success: false,
        message: `Failed to save quote: ${insertRes.error.message}`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Quote generated successfully.',
      data: {
        customerName,
        moveDate,
        subtotal,
        surcharge,
        deposit,
        total,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to save quote: ${error.message}`,
        data: null,
      };
    }

    return {
      success: false,
      message: `Failed to save quote: ${error}`,
      data: null,
    };
  }
};
