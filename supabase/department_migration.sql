-- ─── 1. departments table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.departments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL UNIQUE,
  code         text        NOT NULL UNIQUE,
  manager_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  color        text        NOT NULL DEFAULT '#4f46e5',
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. Add columns to profiles ──────────────────────────────────
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ─── 3. Row Level Security for departments ───────────────────────
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_select" ON public.departments;
CREATE POLICY "departments_select"
  ON public.departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "departments_insert" ON public.departments;
CREATE POLICY "departments_insert"
  ON public.departments FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "departments_update" ON public.departments;
CREATE POLICY "departments_update"
  ON public.departments FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "departments_delete" ON public.departments;
CREATE POLICY "departments_delete"
  ON public.departments FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ─── 4. Admin update policy for profiles ──────────────────────────
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
