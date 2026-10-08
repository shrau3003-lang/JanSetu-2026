-- ============================================================
-- JANSETU SUPABASE DATABASE SCHEMA & RLS POLICIES
-- STAGE 2 — BACKEND FOUNDATION
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- Custom Type Enums
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CITIZEN', 'ADMIN', 'INSTITUTE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE problem_status AS ENUM ('reported', 'pending', 'verified', 'in_progress', 'resolved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('Planning', 'In Progress', 'Field Testing', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'CITIZEN',
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2. PROBLEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  status problem_status NOT NULL DEFAULT 'pending',
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  ai_analysis JSONB,
  supporters_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 3. VOTES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(problem_id, user_id)
);


-- ------------------------------------------------------------
-- 4. COMMENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 5. INSTITUTES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  accreditation TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 6. MATCHES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 7. PROJECTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE SET NULL,
  status project_status NOT NULL DEFAULT 'Planning',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  lead_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 8. PROJECT MEMBERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);


-- ------------------------------------------------------------
-- 9. MILESTONES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 10. CERTIFICATES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  title TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'JanSetu User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CITIZEN'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------
-- STORAGE BUCKET SETUP
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('problems-media', 'problems-media', true)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Problems Policies
CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create problems" ON public.problems FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own problems" ON public.problems FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all problems" ON public.problems FOR ALL USING (public.is_admin());

-- Votes Policies
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Institutes Policies
CREATE POLICY "Institutes are viewable by everyone" ON public.institutes FOR SELECT USING (true);
CREATE POLICY "Institutes/Admins can create institute profiles" ON public.institutes FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY "Institutes/Admins can update institute profiles" ON public.institutes FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

-- Matches Policies
CREATE POLICY "Matches are viewable by authenticated users" ON public.matches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Institutes can manage matches" ON public.matches FOR ALL USING (auth.role() = 'authenticated');

-- Projects Policies
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Institutes/Admins can create projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Institutes/Admins can update projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');

-- Project Members Policies
CREATE POLICY "Project members are viewable by everyone" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Project leaders can add members" ON public.project_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Milestones Policies
CREATE POLICY "Milestones are viewable by everyone" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Project leaders can manage milestones" ON public.milestones FOR ALL USING (auth.role() = 'authenticated');

-- Certificates Policies
CREATE POLICY "Certificates are viewable by everyone" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins/Institutes can issue certificates" ON public.certificates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
