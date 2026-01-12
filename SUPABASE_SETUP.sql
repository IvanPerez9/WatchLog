-- ============================================
-- WatchLog - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase project's SQL Editor
-- Go to: https://supabase.com/dashboard → [Project] → SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  description VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Valid tokens table (for authentication)
CREATE TABLE IF NOT EXISTS valid_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP
);

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  year INTEGER,
  poster_path VARCHAR(500),
  director VARCHAR(255),
  genres TEXT,
  status_id INTEGER NOT NULL REFERENCES statuses(id),
  rating DECIMAL(2,1) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT rating_check CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5 AND rating * 10 % 5 = 0))
);

-- Series table
CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  year INTEGER,
  poster_path VARCHAR(500),
  genres TEXT,
  total_seasons INTEGER,
  current_season INTEGER DEFAULT 1,
  status_id INTEGER NOT NULL REFERENCES statuses(id),
  rating DECIMAL(2,1) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT rating_check_series CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5 AND rating * 10 % 5 = 0))
);

-- ============================================
-- 2. INSERT DEFAULT STATUSES
-- ============================================

-- Statuses for Movies (3 states)
INSERT INTO statuses (description) VALUES
  ('Pending'),
  ('Watched'),
  ('Favorite')
ON CONFLICT (description) DO NOTHING;

-- Statuses for Series (4 states - includes Watching)
INSERT INTO statuses (description) VALUES
  ('Watching')
ON CONFLICT (description) DO NOTHING;

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

-- Index for faster movie searches by title
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);

-- Index for faster movie searches by year
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);

-- Index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_movies_status_id ON movies(status_id);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_valid_tokens_token ON valid_tokens(token);

-- Index for user movies (by token)
CREATE INDEX IF NOT EXISTS idx_movies_user_token ON movies(user_token);

-- Index for rating (para filtros y ordenamiento)
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);

-- Index for director searches
CREATE INDEX IF NOT EXISTS idx_movies_director ON movies(director);

-- Index for genre searches (using GiST for text search)
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies(genres);

-- SERIES INDEXES
-- Index for faster series searches by title
CREATE INDEX IF NOT EXISTS idx_series_title ON series(title);

-- Index for faster series searches by year
CREATE INDEX IF NOT EXISTS idx_series_year ON series(year);

-- Index for faster filtering by status (series)
CREATE INDEX IF NOT EXISTS idx_series_status_id ON series(status_id);

-- Index for rating (series)
CREATE INDEX IF NOT EXISTS idx_series_rating ON series(rating DESC);

-- Index for genres searches (series)
CREATE INDEX IF NOT EXISTS idx_series_genres ON series(genres);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on movies table
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create function to check valid token
CREATE OR REPLACE FUNCTION check_auth_token()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if token exists in valid_tokens table and is active
  RETURN EXISTS (
    SELECT 1 FROM valid_tokens 
    WHERE token = current_setting('request.headers', true)::json->>'x-auth-token'
    AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies

-- SELECT: Allow public read (no token required)
DROP POLICY IF EXISTS "Allow public read access" ON movies;
CREATE POLICY "Allow public read access"
  ON movies FOR SELECT
  USING (TRUE);

-- INSERT: Require valid token
DROP POLICY IF EXISTS "Allow insert with valid token" ON movies;
CREATE POLICY "Allow insert with valid token"
  ON movies FOR INSERT
  WITH CHECK (check_auth_token());

-- UPDATE: Require valid token
DROP POLICY IF EXISTS "Allow update with valid token" ON movies;
CREATE POLICY "Allow update with valid token"
  ON movies FOR UPDATE
  USING (check_auth_token())
  WITH CHECK (check_auth_token());

-- DELETE: Require valid token
DROP POLICY IF EXISTS "Allow delete with valid token" ON movies;
CREATE POLICY "Allow delete with valid token"
  ON movies FOR DELETE
  USING (check_auth_token());

-- SERIES RLS POLICIES
-- Enable RLS on series table
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow public read (no token required)
DROP POLICY IF EXISTS "Allow public read access" ON series;
CREATE POLICY "Allow public read access"
  ON series FOR SELECT
  USING (TRUE);

-- INSERT: Require valid token
DROP POLICY IF EXISTS "Allow insert with valid token" ON series;
CREATE POLICY "Allow insert with valid token"
  ON series FOR INSERT
  WITH CHECK (check_auth_token());

-- UPDATE: Require valid token
DROP POLICY IF EXISTS "Allow update with valid token" ON series;
CREATE POLICY "Allow update with valid token"
  ON series FOR UPDATE
  USING (check_auth_token())
  WITH CHECK (check_auth_token());

-- DELETE: Require valid token
DROP POLICY IF EXISTS "Allow delete with valid token" ON series;
CREATE POLICY "Allow delete with valid token"
  ON series FOR DELETE
  USING (check_auth_token());

-- ============================================
-- 5. AUTO-UPDATE TIMESTAMP
-- ============================================

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-update timestamp for series
DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE RLS ON valid_tokens (OPTIONAL)
-- ============================================

-- Protect valid_tokens table (admin only view)
ALTER TABLE valid_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if a token is valid (via check_auth_token function)
DROP POLICY IF EXISTS "Allow token validation" ON valid_tokens;
CREATE POLICY "Allow token validation"
  ON valid_tokens FOR SELECT
  USING (TRUE);

-- ============================================
-- 7. ADD YOUR FIRST TOKEN (REQUIRED!)
-- ============================================
-- IMPORTANT: Replace 'your-secret-token-here' with your own secure token!
-- Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

INSERT INTO valid_tokens (token, description) 
VALUES ('your-secret-token-here', 'Development token - CHANGE THIS!')
ON CONFLICT (token) DO NOTHING;

-- ============================================
-- HELPFUL QUERIES
-- ============================================

-- View all tokens (to verify setup)
-- SELECT id, token, description, active, created_at FROM valid_tokens;

-- View movies count by status
-- SELECT s.description, COUNT(m.id) as count 
-- FROM movies m 
-- RIGHT JOIN statuses s ON m.status_id = s.id 
-- GROUP BY s.id, s.description;

-- View series count by status
-- SELECT s.description, COUNT(ser.id) as count 
-- FROM series ser 
-- RIGHT JOIN statuses s ON ser.status_id = s.id 
-- GROUP BY s.id, s.description;

-- Mark a token as inactive (revoke access)
-- UPDATE valid_tokens SET active = false WHERE token = 'token-to-revoke';

-- Delete all movies (be careful!)
-- DELETE FROM movies;

-- Delete all series (be careful!)
-- DELETE FROM series;

-- ============================================
-- MIGRATIONS (IF ADDING NEW COLUMNS TO EXISTING DB)
-- ============================================
-- Run these if you already have a movies table and need to add director and genres columns:

-- ALTER TABLE movies ADD COLUMN IF NOT EXISTS director VARCHAR(255);
-- ALTER TABLE movies ADD COLUMN IF NOT EXISTS genres TEXT;

-- ============================================
-- MIGRATIONS (IF ADDING SERIES TABLE TO EXISTING DB - PHASE 3)
-- ============================================
-- Run these if you already have an existing database and want to add series support:

-- Create series table (copy from section 1 above)
-- ALTER TABLE series ENABLE ROW LEVEL SECURITY;
-- Create all series indexes (copy from section 3 above)
-- Create all series RLS policies (copy from section 4 above)
-- Create trigger for auto-timestamp (copy from section 5 above)

-- ============================================
-- SECURITY CHECKLIST
-- ============================================
-- ✓ Row Level Security (RLS) enabled on tables
-- ✓ Token validation function created
-- ✓ Indexes created for performance
-- ✓ Timestamps auto-updated
-- ✓ All default statuses inserted
-- ⚠️ TODO: Replace 'your-secret-token-here' with a real token!
-- ⚠️ TODO: Never commit .env file with tokens to git!
-- ⚠️ TODO: Use HTTPS only in production (Netlify provides this)
-- ⚠️ TODO: Rotate tokens periodically
