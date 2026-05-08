-- ============================================================
-- VELOUR — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ──────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  age INTEGER CHECK (age >= 18 AND age <= 99),
  gender TEXT,
  location_city TEXT,
  location_country TEXT,
  bio TEXT,
  tagline TEXT,
  avatar_url TEXT,
  photos TEXT[] DEFAULT '{}',
  trust_level TEXT NOT NULL DEFAULT 'basic' CHECK (trust_level IN ('basic','verified','community_verified','premium_verified')),
  relationship_type TEXT NOT NULL DEFAULT 'single' CHECK (relationship_type IN ('single','couple','poly','open')),
  is_couple_profile BOOLEAN NOT NULL DEFAULT false,
  couple_partner_id UUID,
  attachment_style TEXT,
  dynamic_role TEXT DEFAULT 'none',
  exploration_level INTEGER CHECK (exploration_level BETWEEN 1 AND 5),
  is_stealth BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── BOUNDARY CATEGORIES ───────────────────────────────────

CREATE TABLE boundary_categories (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO boundary_categories VALUES
  ('kissing','physical','Kissing',NULL,1),
  ('touching','physical','Touch & Affection',NULL,2),
  ('intimacy','physical','Physical Intimacy',NULL,3),
  ('bdsm_light','physical','Soft Kink / Light BDSM',NULL,4),
  ('group','physical','Group Dynamics',NULL,5),
  ('emotional_depth','emotional','Emotional Depth',NULL,10),
  ('vulnerability','emotional','Vulnerability & Sharing',NULL,11),
  ('attachment','emotional','Attachment & Bonding',NULL,12),
  ('jealousy','emotional','Navigating Jealousy Together',NULL,13),
  ('meeting_friends','emotional','Meeting Friends / Social Circle',NULL,14),
  ('frequency','communication','Daily Communication',NULL,20),
  ('calls','communication','Video / Voice Calls',NULL,21),
  ('media','communication','Sharing Photos / Media',NULL,22),
  ('check_ins','communication','Regular Check-ins',NULL,23),
  ('transparency','communication','Full Transparency',NULL,24),
  ('dom_sub','dynamics','Dominance / Submission',NULL,30),
  ('role_play','dynamics','Role Dynamics',NULL,31),
  ('power_exchange','dynamics','Power Exchange',NULL,32),
  ('protocols','dynamics','Protocols & Rules',NULL,33),
  ('collaring','dynamics','Collaring / Formal Agreements',NULL,34),
  ('discretion','privacy','Full Discretion Required',NULL,40),
  ('location','privacy','Sharing Location',NULL,41),
  ('identity','privacy','Identity Disclosure',NULL,42),
  ('social_media','privacy','Social Media Presence',NULL,43),
  ('third_party','privacy','Involving Third Parties',NULL,44);

-- ─── USER BOUNDARIES ───────────────────────────────────────

CREATE TABLE user_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  boundary_id TEXT REFERENCES boundary_categories(id) NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('hard_no','soft_no','maybe','open_to','enthusiastic_yes')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, boundary_id)
);

-- ─── MATCHES ───────────────────────────────────────────────

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_a UUID REFERENCES auth.users(id) NOT NULL,
  user_id_b UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','declined','blocked')),
  compatibility_score FLOAT DEFAULT 0,
  compatibility_breakdown JSONB DEFAULT '{}',
  initiated_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id_a, user_id_b)
);

-- ─── CONVERSATIONS & MESSAGES ──────────────────────────────

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','read','expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── REVIEWS / REPUTATION ──────────────────────────────────

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_id UUID REFERENCES auth.users(id) NOT NULL,
  communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
  respect_score INTEGER CHECK (respect_score BETWEEN 1 AND 5),
  safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 5),
  honesty_score INTEGER CHECK (honesty_score BETWEEN 1 AND 5),
  boundaries_score INTEGER CHECK (boundaries_score BETWEEN 1 AND 5),
  overall_score FLOAT GENERATED ALWAYS AS (
    (communication_score + respect_score + safety_score + honesty_score + boundaries_score) / 5.0
  ) STORED,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_id)
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: visible to all authenticated, editable only by owner
CREATE POLICY "Public profiles are visible" ON profiles FOR SELECT TO authenticated USING (NOT is_hidden OR user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Boundaries: private to owner
CREATE POLICY "Own boundaries only" ON user_boundaries FOR ALL TO authenticated USING (user_id = auth.uid());

-- Matches: visible to participants
CREATE POLICY "Match participants" ON matches FOR SELECT TO authenticated USING (user_id_a = auth.uid() OR user_id_b = auth.uid());
CREATE POLICY "Insert matches" ON matches FOR INSERT TO authenticated WITH CHECK (initiated_by = auth.uid());

-- Messages: only participants
CREATE POLICY "Conversation participants" ON messages FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT id FROM conversations WHERE auth.uid() = ANY(participant_ids))
);
CREATE POLICY "Send messages" ON messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- ─── REALTIME ──────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ─── STORAGE BUCKETS ───────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
