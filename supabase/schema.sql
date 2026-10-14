-- =============================================
-- ReachQR — full schema for a FRESH Supabase project.
-- Run once in the Supabase SQL editor.
--
-- Upgrading an existing project? Run the files in
-- supabase/migrations/ instead (they are idempotent).
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  tagline text,
  logo_url text,
  theme text NOT NULL DEFAULT 'classic',
  -- Contact
  email text NOT NULL,
  show_email boolean NOT NULL DEFAULT true,
  whatsapp_e164 text,
  whatsapp_message text,
  phone text,
  address text,
  -- Links
  website_url text,
  instagram_url text,
  twitter_url text,
  tiktok_url text,
  facebook_url text,
  linkedin_url text,
  youtube_url text,
  telegram_url text,
  -- Stats
  views integer NOT NULL DEFAULT 0,
  -- Security (only hashes are stored, never the raw tokens)
  edit_token_hash text NOT NULL,
  recovery_token_hash text,
  recovery_expires_at timestamptz,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_edit_token_hash ON profiles(edit_token_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_recovery_token_hash ON profiles(recovery_token_hash);

-- RLS is on with NO policies: the anon key can't read or write anything.
-- All access goes through the Next.js API using the service role key.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Atomic view counter
CREATE OR REPLACE FUNCTION increment_profile_views(p_slug text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE profiles SET views = COALESCE(views, 0) + 1 WHERE slug = lower(p_slug);
$$;

REVOKE EXECUTE ON FUNCTION increment_profile_views(text) FROM PUBLIC, anon, authenticated;

-- =============================================
-- RATE LIMITS (shared across serverless instances)
-- =============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Returns true when the request is allowed.
CREATE OR REPLACE FUNCTION hit_rate_limit(p_key text, p_max integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limits AS r (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE r.count + 1
    END,
    window_start = CASE
      WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE r.window_start
    END
  RETURNING count INTO v_count;

  RETURN v_count <= p_max;
END;
$$;

REVOKE EXECUTE ON FUNCTION hit_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- =============================================
-- STORAGE: public "logos" bucket (uploads go through the API)
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');
