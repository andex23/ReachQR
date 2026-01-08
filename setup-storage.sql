-- =============================================
-- REACH QR - Storage Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the 'logos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Public Read Access (Anyone can view logos)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- Note: We do NOT enable Public Write access.
-- Uploads will be handled by our secure API endpoint.
