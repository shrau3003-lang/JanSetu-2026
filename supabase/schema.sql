-- ============================================================
-- JANSETU SUPABASE DATABASE SCHEMA
-- Backend foundation matching the React frontend
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'CITIZEN',
    'ADMIN',
    'INSTITUTE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE problem_status AS ENUM (
    'reported',
    'pending',
    'verified',
    'in_progress',
    'resolved',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'ACCEPTED',
    'TEAM_FORMING',
    'IDEATION',
    'PROTOTYPE',
    'FIELD_TESTING',
    'DEPLOYMENT',
    'COMPLETED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM (
    'PENDING',
    'SUBMITTED_FOR_REVIEW',
    'APPROVED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 1. PROFILES
-- ============================================================

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


-- ============================================================
-- 2. PROBLEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  author_id UUID REFERENCES public.profiles(id)
    ON DELETE SET NULL,

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


-- ============================================================
-- 3. VOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  problem_id UUID NOT NULL
    REFERENCES public.problems(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(problem_id, user_id)
);


-- ============================================================
-- 4. COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  problem_id UUID NOT NULL
    REFERENCES public.problems(id)
    ON DELETE CASCADE,

  author_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. INSTITUTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  profile_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  department TEXT,

  accreditation TEXT,

  verified BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. MATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  problem_id UUID NOT NULL
    REFERENCES public.problems(id)
    ON DELETE CASCADE,

  institute_id UUID NOT NULL
    REFERENCES public.institutes(id)
    ON DELETE CASCADE,

  match_score INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'suggested',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title TEXT NOT NULL,

  problem_id UUID
    REFERENCES public.problems(id)
    ON DELETE SET NULL,

  institute_id UUID
    REFERENCES public.institutes(id)
    ON DELETE SET NULL,

  status project_status NOT NULL DEFAULT 'ACCEPTED',

  progress_percentage INTEGER NOT NULL DEFAULT 0
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  lead_name TEXT,

  location TEXT,

  guide_institute TEXT,

  image TEXT,

  current_milestone TEXT,

  next_deadline DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. PROJECT MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL
    REFERENCES public.projects(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  role_title TEXT NOT NULL,

  department TEXT,

  avatar TEXT,

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, user_id)
);


-- ============================================================
-- 9. MILESTONES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL
    REFERENCES public.projects(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,

  description TEXT,

  completed BOOLEAN NOT NULL DEFAULT FALSE,

  due_date DATE,

  status milestone_status NOT NULL DEFAULT 'PENDING',

  evidence_text TEXT,

  evidence_url TEXT,

  submitted_at TIMESTAMPTZ,

  reviewed_at TIMESTAMPTZ,

  government_feedback TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 10. CERTIFICATES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID
    REFERENCES public.projects(id)
    ON DELETE SET NULL,

  recipient_name TEXT NOT NULL,

  title TEXT NOT NULL,

  certificate_code TEXT NOT NULL UNIQUE,

  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,

  message TEXT NOT NULL,

  read BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
BEGIN

  requested_role := NEW.raw_user_meta_data->>'role';

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url
  )
  VALUES (
    NEW.id,

    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      'JanSetu User'
    ),

    NEW.email,

    CASE
      WHEN requested_role IN ('CITIZEN', 'ADMIN', 'INSTITUTE')
        THEN requested_role::user_role
      ELSE 'CITIZEN'::user_role
    END,

    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (
  id,
  name,
  public
)
VALUES (
  'problems-media',
  'problems-media',
  true
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- RLS
-- ============================================================

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


-- ============================================================
-- ADMIN HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'ADMIN'
  );
$$;


-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
ON public.profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- PROBLEMS POLICIES
-- ============================================================

CREATE POLICY "problems_select"
ON public.problems
FOR SELECT
USING (true);

CREATE POLICY "problems_insert_own"
ON public.problems
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "problems_update_own"
ON public.problems
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "problems_admin_all"
ON public.problems
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- VOTES POLICIES
-- ============================================================

CREATE POLICY "votes_select"
ON public.votes
FOR SELECT
USING (true);

CREATE POLICY "votes_insert_own"
ON public.votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_delete_own"
ON public.votes
FOR DELETE
USING (auth.uid() = user_id);


-- ============================================================
-- COMMENTS POLICIES
-- ============================================================

CREATE POLICY "comments_select"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "comments_insert_own"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);


-- ============================================================
-- INSTITUTES POLICIES
-- ============================================================

CREATE POLICY "institutes_select"
ON public.institutes
FOR SELECT
USING (true);

CREATE POLICY "institutes_insert_own_or_admin"
ON public.institutes
FOR INSERT
WITH CHECK (
  auth.uid() = profile_id
  OR public.is_admin()
);

CREATE POLICY "institutes_update_own_or_admin"
ON public.institutes
FOR UPDATE
USING (
  auth.uid() = profile_id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = profile_id
  OR public.is_admin()
);


-- ============================================================
-- MATCH POLICIES
-- ============================================================

CREATE POLICY "matches_authenticated_select"
ON public.matches
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "matches_admin_manage"
ON public.matches
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "matches_institute_update"
ON public.matches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.institutes i
    WHERE i.id = matches.institute_id
      AND i.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.institutes i
    WHERE i.id = matches.institute_id
      AND i.profile_id = auth.uid()
  )
);


-- ============================================================
-- PROJECT POLICIES
-- ============================================================

CREATE POLICY "projects_select"
ON public.projects
FOR SELECT
USING (true);

CREATE POLICY "projects_admin_insert"
ON public.projects
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "projects_institute_insert"
ON public.projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.institutes i
    WHERE i.id = projects.institute_id
      AND i.profile_id = auth.uid()
  )
);

CREATE POLICY "projects_admin_update"
ON public.projects
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "projects_institute_update"
ON public.projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.institutes i
    WHERE i.id = projects.institute_id
      AND i.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.institutes i
    WHERE i.id = projects.institute_id
      AND i.profile_id = auth.uid()
  )
);


-- ============================================================
-- PROJECT MEMBER POLICIES
-- ============================================================

CREATE POLICY "project_members_select"
ON public.project_members
FOR SELECT
USING (true);

CREATE POLICY "project_members_admin_insert"
ON public.project_members
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "project_members_authenticated_insert"
ON public.project_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_members_admin_update"
ON public.project_members
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- MILESTONE POLICIES
-- ============================================================

CREATE POLICY "milestones_select"
ON public.milestones
FOR SELECT
USING (true);

CREATE POLICY "milestones_admin_manage"
ON public.milestones
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "milestones_project_institute_manage"
ON public.milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.institutes i
      ON i.id = p.institute_id
    WHERE p.id = milestones.project_id
      AND i.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.institutes i
      ON i.id = p.institute_id
    WHERE p.id = milestones.project_id
      AND i.profile_id = auth.uid()
  )
);


-- ============================================================
-- CERTIFICATE POLICIES
-- ============================================================

CREATE POLICY "certificates_select"
ON public.certificates
FOR SELECT
USING (true);

CREATE POLICY "certificates_admin_insert"
ON public.certificates
FOR INSERT
WITH CHECK (public.is_admin());


-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

CREATE POLICY "notifications_select_own"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_admin_insert"
ON public.notifications
FOR INSERT
WITH CHECK (public.is_admin());


-- ============================================================
-- STORAGE POLICIES
-- ============================================================

CREATE POLICY "problems_media_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'problems-media');

CREATE POLICY "problems_media_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'problems-media');

CREATE POLICY "problems_media_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'problems-media'
  AND owner_id = auth.uid()::text
);

CREATE POLICY "problems_media_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'problems-media'
  AND owner_id = auth.uid()::text
);