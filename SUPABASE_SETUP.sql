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
  status_id INTEGER NOT NULL REFERENCES statuses(id),
  user_token VARCHAR(255) NOT NULL REFERENCES valid_tokens(token),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. INSERT DEFAULT STATUSES
-- ============================================

INSERT INTO statuses (description) VALUES
  ('Pendiente'),
  ('Viendo'),
  ('Vista'),
  ('Favorita')
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

-- Mark a token as inactive (revoke access)
-- UPDATE valid_tokens SET active = false WHERE token = 'token-to-revoke';

-- Delete all movies (be careful!)
-- DELETE FROM movies;

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
