# Reach

A QR contact page generator for small businesses and freelancers. Create a beautiful QR code that opens a clean contact page with WhatsApp, phone, email, and more.

## Features

- 🚀 **Fast Setup** - Create a contact page in seconds, no account required
- 📱 **QR Code Generation** - Download a high-quality PNG QR code
- 💬 **WhatsApp Integration** - Primary CTA with pre-filled message
- 🔒 **Secure Edit Links** - Edit your page anytime with a private token
- 🎨 **Beautiful Design** - Warm, minimalist aesthetic with micro-interactions

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **QR Generation**: [qrcode](https://www.npmjs.com/package/qrcode)

## Getting Started

### 1. Clone and Install

```bash
cd Reach
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings > API** and copy your keys

### 3. Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/create` |
| `/create` | Create a new contact page |
| `/success` | Shows QR code and edit link |
| `/edit/[token]` | Edit an existing page |
| `/u/[slug]` | Public profile page |

## Database Schema

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  tagline text,
  whatsapp_e164 text NOT NULL,
  phone text,
  email text,
  instagram_url text,
  address text,
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
