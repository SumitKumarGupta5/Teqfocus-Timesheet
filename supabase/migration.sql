-- ═══════════════════════════════════════════════════════════════
-- Employee Worklog Tracker — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text,
  avatar_url   text,
  role         text        NOT NULL DEFAULT 'employee'
                           CHECK (role IN ('employee', 'manager', 'admin')),
  weekly_goal  integer     NOT NULL DEFAULT 40
                           CHECK (weekly_goal >= 1 AND weekly_goal <= 168),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. projects (company-wide) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL UNIQUE,
  color       text        NOT NULL DEFAULT '#4f46e5',
  is_active   boolean     NOT NULL DEFAULT true,
  created_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 3. work_logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.work_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id  uuid        REFERENCES public.projects(id) ON DELETE SET NULL,
  date        date        NOT NULL,
  hours       numeric(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  category    text        NOT NULL
                          CHECK (category IN (
                            'on_project',
                            'shadow',
                            'bench',
                            'leave',
                            'training',
                            'other_project_support'
                          )),
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_work_logs_user_date ON public.work_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON public.work_logs (date DESC);

-- ─── 4. Row Level Security ──────────────────────────────────────

-- profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read all profiles (needed for manager/admin views)
-- Note: restrict sensitive fields via SELECT column list if needed
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- projects RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read projects
CREATE POLICY "projects_select"
  ON public.projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete projects
CREATE POLICY "projects_insert_admin"
  ON public.projects FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "projects_update_admin"
  ON public.projects FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "projects_delete_admin"
  ON public.projects FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- work_logs RLS
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- Employees see only their own logs; managers/admins see all
CREATE POLICY "work_logs_select"
  ON public.work_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'admin')
  );

-- Users can only insert their own logs
CREATE POLICY "work_logs_insert"
  ON public.work_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own logs
CREATE POLICY "work_logs_update"
  ON public.work_logs FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own logs; admins can delete any
CREATE POLICY "work_logs_delete"
  ON public.work_logs FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─── 5. Seed first admin ───────────────────────────────────────
-- After the first user signs up via magic link, run this in SQL Editor:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<paste-user-id>';
-- Get the user ID from: Supabase Dashboard → Authentication → Users

-- ─── 6. Seed Data ───────────────────────────────────────────────
INSERT INTO public.projects (name, color) VALUES
  ('MERN Stack Project', '#61dafb'),
  ('Salesforce Admin Project', '#00a1e0'),
  ('Salesforce Development Project', '#1798c1'),
  ('React Native Mobile App', '#4f46e5'),
  ('AWS Infrastructure Setup', '#ff9900'),
  ('Internal Tooling', '#22c55e')
ON CONFLICT (name) DO NOTHING;
