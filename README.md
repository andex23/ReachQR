# ReachQR

A free contact page + QR code for small businesses and freelancers. Customers scan, tap, and they're chatting with you on WhatsApp, calling, emailing, or getting directions. No app, no account.

## Features

- **60-second setup**, no account. A private edit link is emailed to the owner.
- **WhatsApp first**, with a custom pre-filled greeting (WhatsApp is optional).
- **Six themes** for the public page, with a live phone preview while you edit.
- **Contact options**: WhatsApp, call, email (can be hidden), directions, website, Instagram, TikTok, X, Facebook, LinkedIn, YouTube, Telegram.
- **Save contact**: one-tap vCard download with logo and links.
- **QR downloads**: high-res PNG, SVG for print, and a ready-made printable sign.
- **Visit counter** on the owner's edit page.
- **Safe recovery**: "lost my link" emails a one-hour link; the old edit link keeps working until the owner uses it.
- **Admin dashboard** at `/admin`: stats, search, delete, send an owner a recovery link, email everyone.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage), accessed only from the server
- Resend for email
- [qrcode](https://www.npmjs.com/package/qrcode)
- Vitest for unit tests

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

### Database

- **New Supabase project:** run `supabase/schema.sql` in the SQL editor.
- **Existing project:** run `supabase/migrations/001_rework.sql`. It's idempotent and:
  - adds the new columns (`theme`, `show_email`, `whatsapp_message`, `telegram_url`, `views`, recovery tokens),
  - **removes the public `SELECT` policy** so the anon key can no longer read every row,
  - adds `increment_profile_views` and `hit_rate_limit` functions plus a `rate_limits` table.

The app works before the migration is applied (it falls back to in-memory rate limiting and read-then-write view counts), but **the data exposure is only fixed once the migration runs.**

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server only |
| `NEXT_PUBLIC_BASE_URL` | yes | Used in emails, QR codes and metadata |
| `RESEND_API_KEY` | for email | |
| `EMAIL_FROM` | for email | A sender on a domain verified in Resend |
| `ADMIN_PASSWORD` | for `/admin` | |
| `ADMIN_SESSION_SECRET` | optional | Extra secret mixed into admin session cookies |

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is no longer used.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # unit tests (Vitest)
```

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/create` | Step-by-step page builder with live preview |
| `/success` | QR code downloads and private edit link |
| `/edit/[token]` | Edit a page (token = private edit link) |
| `/u/[slug]` | Public contact page |
| `/u/[slug]/vcard` | "Save contact" vCard download |
| `/recover` | Request a recovery email |
| `/recover/[token]` | Redeem a recovery link for a new edit link |
| `/admin` | Admin dashboard |

## Project layout

```
src/lib/profile.ts        Profile model: validation, form <-> row <-> card (shared client/server)
src/lib/themes.ts         Theme palettes
src/lib/countries.ts      Dial codes, E.164 formatting/parsing
src/lib/server-utils.ts   Tokens, rate limiting, base URL, error responses
src/lib/admin-auth.ts     Signed httpOnly admin session cookie
src/lib/recovery.ts       Non-destructive edit-link recovery
src/components/ProfileCard.tsx   The public card (also used for live previews)
src/components/form/      Shared create/edit form fields
supabase/                 Schema + migrations
```
