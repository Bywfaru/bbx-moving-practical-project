# BBX Moving – Moving Quote Form

A single public page where a customer in British Columbia requests a moving quote. Built for the BBX Moving web
developer practical project.

**Live site:** https://bbx-moving-practical-project.vercel.app/

## What I chose and why

| Area         | Choice                                                  | Why                                                                                                                          |
|--------------|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| Framework    | Next.js (App Router) + React + TypeScript               | One codebase for the page and the server code, deployed free on Vercel.                                                      |
| Server logic | A Next.js server action (`src/actions/createQuote.ts`)  | The quote and deposit are calculated on the server from the customer's inputs. No price is ever sent from the browser.       |
| Validation   | One Zod schema (`src/schemas/movingQuoteFormSchema.ts`) | The same rules run in the browser (react-hook-form) for fast feedback and again on the server, which is the one that counts. |
| UI           | Tailwind CSS + shadcn/ui                                | Accessible form controls and a layout that works on a phone.                                                                 |
| Storage      | Supabase (Postgres), `bookings` table                   | See below.                                                                                                                   |
| Tests        | Vitest                                                  | Fast, and works well with TypeScript.                                                                                        |

### Storage

I chose **Supabase Postgres** because it is free, hosted, and a real relational database: I can add a unique constraint,
inspect the saved rows in a dashboard, and the same table can grow into a real booking system. Each submission is stored
with its inputs and the calculated subtotal, surcharge, deposit and total.

**Duplicate submissions:** the server hashes the validated input into an `idempotency_key`, which has a unique
constraint in the database. Clicking submit more than once saves exactly one booking, and a repeat request returns the
existing quote instead of an error. The submit button is also disabled while a request is in flight.

**With real customers** I would keep Postgres but add backups, row-level security, an admin view for staff, and
encryption or retention rules for the customer's name and email (they are personal information).

## Business rules

All prices and rules live in `src/config/config.ts` (base fee, per-bedroom and per-km prices, surcharge, deposit
percentage, the five BC statutory holidays, and the Vancouver time zone). The calculations are small pure functions in
`src/lib/`:

- `calculateSubtotal` – base fee + bedrooms + distance
- `calculateSurcharge` – 20% of the subtotal when the move date is a Saturday, Sunday or listed holiday (applied once)
- `calculateDeposit` – 25% of the final quote, rounded to the nearest whole dollar (halves round up)

## Running it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests
```

Create `.env.local` with your Supabase project values:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

## How I tested

Vitest unit tests cover the three calculation functions:

- subtotal with default and overridden prices
- surcharge on Saturdays, Sundays and holidays, and none on the days around them
- deposit rounding, including the $90.50 → $91 case

I also tested the form manually in the browser.

## What I would do differently with more time

- Add end-to-end tests with Playwright covering the whole form, and tests for the server action itself (validation
  failures, duplicate submissions).
- Pull the holiday list out of code so it can be updated without a deploy. It only covers the five dates in the brief.
- Show friendlier validation errors from the server; the raw Zod message is hard to read.

## What I would add before real customers use it

- Use a publishable Supabase key with an insert-only row-level-security policy instead of the secret key.
- Rate limiting and bot protection (e.g. CAPTCHA) on the form.
- Email confirmation to the customer and a notification to the BBX team.
- Privacy notice and a data-retention policy for stored customer details.
- Monitoring and error reporting.

