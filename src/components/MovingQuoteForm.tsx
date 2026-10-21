'use client';

import { FC, useState } from 'react';
import { format } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { config } from '@/config/config';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectRootProps } from '@base-ui/react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { PropsSingle } from 'react-day-picker';
import { movingQuoteFormSchema, MovingQuoteFormSchema } from '@/schemas/movingQuoteFormSchema';
import { createQuote, CreateQuoteReturn } from '@/actions/createQuote';

/**
 * The earliest move date is tomorrow in Vancouver, regardless of the customer's own time zone. Dates are compared as
 * yyyy-MM-dd strings, which sort chronologically.
 */
const isMoveDateDisabled = (date: Date): boolean => {
  const todayInVancouver = format(new TZDate(Date.now(), config.timezone), config.dateFormat);

  return format(date, config.dateFormat) <= todayInVancouver;
};

const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

const NUM_BEDROOM_OPTIONS: SelectRootProps<number>['items'] = [
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  }, {
    label: '3',
    value: 3,
  }, {
    label: '4+',
    value: 4,
  },
];

export const MovingQuoteForm: FC = () => {
  const form = useForm<MovingQuoteFormSchema>({
    resolver: zodResolver(movingQuoteFormSchema),
    defaultValues: {
      moveDate: '',
      customerEmail: '',
      customerName: '',
      moveDistanceKm: 1,
      numBedrooms: 1,
    },
  });
  const [moveDate, setMoveDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quote, setQuote] = useState<CreateQuoteReturn['data']>(null);
  const [quoteMessage, setQuoteMessage] = useState<string | null>(null);

  const handleResetClick = () => {
    form.reset();
    setMoveDate(undefined);
    setSubmitError(null);
    setQuote(null);
    setQuoteMessage(null);
  };

  const handleSubmit: SubmitHandler<MovingQuoteFormSchema> = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setQuote(null);
    setQuoteMessage(null);

    try {
      const quoteRes = await createQuote(data);
      console.log(quoteRes);

      if (quoteRes.success) {
        setQuote(quoteRes.data);
        setQuoteMessage(quoteRes.message);
      } else {
        setSubmitError(quoteRes.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to create quote:', error);
        setSubmitError(`Failed to create quote: ${error.message}`);
      } else {
        console.error('Failed to create quote: Unknown error -', error);
        setSubmitError('Failed to create quote: Unknown error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect: PropsSingle['onSelect'] = (date) => {
    if (!date) return;

    setMoveDate(date);
    form.setValue('moveDate', format(date, config.dateFormat));
  };

  return (
    <form id="form-moving-quote" onSubmit={form.handleSubmit(handleSubmit)} className="w-full max-w-md">
      <Card className="w-full">
        <CardHeader >
          <CardTitle >Moving quote</CardTitle >
          <CardDescription >
            Enter your moving details to get a quote.
          </CardDescription >
        </CardHeader >

        <CardContent >
          <FieldGroup >
            <Controller
              name="numBedrooms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Number of bedrooms
                  </FieldLabel >

                  <Select
                    id={field.name} items={NUM_BEDROOM_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    onOpenChange={(open) => {
                      if (!open) field.onBlur();
                    }}
                  >
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue />
                    </SelectTrigger >

                    <SelectContent >
                      <SelectGroup >
                        <SelectLabel >Number of bedrooms</SelectLabel >
                        {NUM_BEDROOM_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem >
                        ))}
                      </SelectGroup >
                    </SelectContent >
                  </Select >
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field >
              )}
            />

            <Controller
              name="moveDistanceKm"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Move distance (km)</FieldLabel >

                  <Input {...field}
                    id={field.name}
                    type="number"
                    min={config.minDistance}
                    max={config.maxDistance}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field >
              )}
            />

            <Controller
              name="moveDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Move date</FieldLabel >

                  <Popover >
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          data-empty={!moveDate}
                          className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                        />
                      }
                    >
                      <CalendarIcon />
                      {moveDate ? format(moveDate, config.dateFormat) : <span >Pick a date</span >}
                    </PopoverTrigger >
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        disabled={isMoveDateDisabled}
                        selected={moveDate}
                        onSelect={handleDateSelect}
                      />
                    </PopoverContent >
                  </Popover >
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field >
              )}
            />

            <Controller
              name="customerName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel >

                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field >
              )}
            />

            <Controller
              name="customerEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel >

                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field >
              )}
            />
          </FieldGroup >

          {submitError && <FieldError className="mt-4">{submitError}</FieldError >}

          {quote && (
            <div className="mt-4 flex flex-col gap-2 text-sm" aria-live="polite">
              {quoteMessage && <p >{quoteMessage}</p >}

              <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                <dt >Name</dt >
                <dd className="text-right">{quote.customerName}</dd >
                <dt >Move date</dt >
                <dd className="text-right">{quote.moveDate}</dd >
                <dt >Subtotal</dt >
                <dd className="text-right">{currencyFormatter.format(quote.subtotal)}</dd >
                <dt >Weekend/holiday surcharge</dt >
                <dd className="text-right">{currencyFormatter.format(quote.surcharge)}</dd >
                <dt >Deposit</dt >
                <dd className="text-right">{currencyFormatter.format(quote.deposit)}</dd >
                <dt className="font-semibold">Total</dt >
                <dd className="text-right font-semibold">{currencyFormatter.format(quote.total)}</dd >
              </dl >
            </div >
          )}
        </CardContent >

        <CardFooter >
          <Field orientation="horizontal">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleResetClick}>
              Reset
            </Button >

            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button >
          </Field >
        </CardFooter >
      </Card >
    </form >
  );
};
