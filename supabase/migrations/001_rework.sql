-- =============================================
-- ReachQR rework migration — run this on an EXISTING project.
-- Safe to run more than once.
-- =============================================

-- 1. Columns that older installs may be missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- 2. New product features
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'classic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_message text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_url text;
ALTER TABLE profiles ALTER COLUMN whatsapp_e164 DROP NOT NULL;

-- 3. Non-destructive edit-link recovery
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_token_hash text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_expires_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_profiles_recovery_token_hash ON profiles(recovery_token_hash);

-- 4. SECURITY: stop exposing every row (emails, numbers, token hashes)
--    to anyone holding the public anon key.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Atomic view counter
CREATE OR REPLACE FUNCTION increment_profile_views(p_slug text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE profiles SET views = COALESCE(views, 0) + 1 WHERE slug = lower(p_slug);
$$;

REVOKE EXECUTE ON FUNCTION increment_profile_views(text) FROM PUBLIC, anon, authenticated;

-- 6. Rate limiting shared across serverless instances
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

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

-- 7. Storage bucket (no-op if it already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;
