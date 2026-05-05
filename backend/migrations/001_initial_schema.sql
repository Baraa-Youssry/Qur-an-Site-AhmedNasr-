-- =============================================
-- Qur'an Reciter Website — Database Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Surahs table
CREATE TABLE IF NOT EXISTS surahs (
  id            SERIAL PRIMARY KEY,
  number        SMALLINT NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 114),
  name_ar       VARCHAR(100) NOT NULL,
  name_en       VARCHAR(100) NOT NULL,
  revelation    VARCHAR(10) NOT NULL CHECK (revelation IN ('Makki', 'Madani')),
  ayah_count    SMALLINT NOT NULL,
  audio_url     TEXT NOT NULL,
  audio_path    TEXT NOT NULL,
  duration_sec  INTEGER,
  file_size_kb  INTEGER,
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clips table
CREATE TABLE IF NOT EXISTS clips (
  id              SERIAL PRIMARY KEY,
  title_ar        VARCHAR(200) NOT NULL,
  title_en        VARCHAR(200) NOT NULL,
  description_ar  TEXT,
  description_en  TEXT,
  youtube_url     TEXT NOT NULL,
  youtube_id      VARCHAR(20) NOT NULL,
  sort_order      SMALLINT DEFAULT 0,
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Social links table
CREATE TABLE IF NOT EXISTS social_links (
  id         SERIAL PRIMARY KEY,
  platform   VARCHAR(50) NOT NULL,
  url        TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE
);

-- 4. Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- 5. Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id              SERIAL PRIMARY KEY,
  year            VARCHAR(20) NOT NULL,
  title_ar        VARCHAR(200) NOT NULL,
  title_en        VARCHAR(200) NOT NULL,
  description_ar  TEXT,
  description_en  TEXT,
  sort_order      SMALLINT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_surahs_number ON surahs(number);
CREATE INDEX IF NOT EXISTS idx_surahs_published ON surahs(is_published);
CREATE INDEX IF NOT EXISTS idx_clips_sort ON clips(sort_order);
CREATE INDEX IF NOT EXISTS idx_clips_published ON clips(is_published);
CREATE INDEX IF NOT EXISTS idx_social_links_sort ON social_links(sort_order);
CREATE INDEX IF NOT EXISTS idx_milestones_sort ON milestones(sort_order);

-- 7. Enable RLS on all tables
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Surahs: public read, service_role full access
CREATE POLICY "Public read published surahs" ON surahs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role full access surahs" ON surahs
  FOR ALL USING (auth.role() = 'service_role');

-- Clips: public read published, service_role full access
CREATE POLICY "Public read published clips" ON clips
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role full access clips" ON clips
  FOR ALL USING (auth.role() = 'service_role');

-- Social links: public read active, service_role full access
CREATE POLICY "Public read active social links" ON social_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access social links" ON social_links
  FOR ALL USING (auth.role() = 'service_role');

-- Site settings: public read, service_role full access
CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role full access site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Milestones: public read active, service_role full access
CREATE POLICY "Public read active milestones" ON milestones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access milestones" ON milestones
  FOR ALL USING (auth.role() = 'service_role');

-- 9. Seed data
INSERT INTO site_settings (key, value) VALUES
  ('reciter_name_ar', 'أحمد عبد الرازق نصر'),
  ('reciter_name_en', 'Ahmed Abdelrazek Nasr'),
  ('bio_ar', ''),
  ('bio_en', ''),
  ('contact_email', ''),
  ('profile_image_url', '')
ON CONFLICT (key) DO NOTHING;
