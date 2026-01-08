# ReachQR

A QR contact page generator for small businesses and freelancers. Create a beautiful QR code that opens a clean contact page with WhatsApp, phone, email, and more.

## Features

- 🚀 **Fast Setup** - Create a contact page in seconds, no account required
- 📱 **QR Code Generation** - Download a high-quality PNG QR code
- 💬 **WhatsApp Integration** - Primary CTA with pre-filled message
- 🖼️ **Logo Support** - Add your business logo or use a generated letter avatar
- 🔗 **Social Links** - Instagram, TikTok, X (Twitter), LinkedIn, and Website
- 🔒 **Secure Edit Links** - Edit your page anytime with a private token
- 🎨 **Beautiful Design** - Warm, minimalist aesthetic with micro-interactions
- 📱 **Responsive** - Optimized for all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **QR Generation**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Email**: Resend (for edit link recovery)

## Getting Started

### 1. Clone and Install

```bash
cd Reach
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. **Important**: Also run the contents of `setup-storage.sql` to enable file uploads
4. Go to **Settings > API** and copy your keys

### 3. Configure Environment

Duplicate `.env.example` to create `.env.local` and populate it with your Supabase and Resend credentials.

### 4. Run Development Server

```bash
npm run dev
```

Open the application in your browser.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/create` | Create a new contact page |
| `/success` | Shows QR code and edit link |
| `/edit/[token]` | Edit an existing page |
| `/u/[slug]` | Public profile page |
| `/recover` | Recover lost edit links |

## Database Schema

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  tagline text,
  logo_url text,           -- New!
  whatsapp_e164 text NOT NULL,
  phone text,
  email text,
  -- Socials
  instagram_url text,
  twitter_url text,
  tiktok_url text,
  facebook_url text,
  linkedin_url text,       -- New!
  youtube_url text,
  website_url text,
  -- Location
  address text,
  -- Security
  edit_token_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Security

- **Honeypot Field**: Hidden form field to catch bots
- **Rate Limiting**: 5 requests per minute per IP for profile creation
- **Hashed Tokens**: Edit tokens are hashed with SHA-256 before storage
- **RLS Policies**: Row-level security for database access control
- **Server-Side Mutations**: All inserts/updates go through API routes with service role

## License

MIT
