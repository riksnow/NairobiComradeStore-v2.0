# NairobiComradeStore (NCS)

A full-stack Kenyan e-commerce marketplace — *by comrades, for comrades* across Kenyan
universities, colleges and learning institutions. Built on Next.js 15 (App Router, TS),
Tailwind v4, MongoDB/Mongoose, Auth.js v5, Resend and M-Pesa Daraja. Prices in **Ksh**.

## Quick start

```bash
npm install
npm run seed                       
npm run dev
```

Open http://localhost:3000.

## Two ways to run

The same codebase runs **with or without a database**:

- **With a database** — set `MONGODB_URI`. Every feature is wired to MongoDB: auth,
  accounts, addresses, orders, checkout, notifications, reviews, the newsletter, and the
  full admin panel. Storefront pages (home, category, product) read live data.
- **Without a database** — leave `MONGODB_URI` empty. The storefront falls back to the
  bundled catalog so the UI still works for previews. (Sign-in/orders need the DB.)

## Admin panel

Sign in as an admin and open **Admin panel** from the header account menu (`/admin`):

- **Overview** — live KPIs and orders-by-status from the database.
- **Products** — create, edit, delete, publish/unpublish.
- **Orders** — advance status (Pending → Processing → Shipped → Delivered, or Cancelled),
  which triggers customer emails + notifications.
- **Customers** — toggle role/active, delete. The store always keeps **at least one active admin**.
- **Reviews** — approve / unapprove / delete (product ratings recalculate automatically).
- **Coupons / Banners** — create, toggle, delete.
- **Newsletter** — compose and send a broadcast to all subscribers via Resend.
- **Settings** — store name, support contacts, address.

## Environment variables

See `.env.local.example`. Key names: `AUTH_SECRET`, `MONGODB_URI`, `GOOGLE_CLIENT_ID/SECRET`,
`RESEND_API_KEY`, `SENDER_EMAIL`/`EMAIL_FROM`, `MPESA_*` (with `MPESA_ENV`), `UPLOADTHING_*`.

## Stack

Next.js 15 · TypeScript · Tailwind v4 · Framer Motion · MongoDB/Mongoose · Auth.js v5
(Credentials + Google) · bcryptjs · Resend · M-Pesa Daraja.
