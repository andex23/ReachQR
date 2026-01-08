-- =============================================
-- REACH QR - QR Contact Page Generator
-- Supabase Database Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  tagline text,
  email text NOT NULL,
  whatsapp_e164 text NOT NULL,
  phone text,
  logo_url text,
  -- Social Links
  instagram_url text,
  twitter_url text,
  tiktok_url text,
  facebook_url text,
  linkedin_url text,
  youtube_url text,
  website_url text,
  -- Location
  address text,
  -- Security
  edit_token_hash text NOT NULL,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_edit_token_hash ON profiles(edit_token_hash);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION: Add new columns to existing table
-- =============================================
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url text;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url text;
