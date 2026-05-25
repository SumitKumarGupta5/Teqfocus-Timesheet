-- ═══════════════════════════════════════════════════════════════
-- Employee Worklog Tracker — Projects and Project Members Migration
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Modify public.projects ───────────────────────────────────
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- ─── 2. Create public.project_members ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_members (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- ─── 3. Helper Functions ──────────────────────────────────────────

-- Helper function to check if a user is the manager of a project's department.
-- Must be SECURITY DEFINER and LANGUAGE plpgsql to bypass RLS and avoid infinite recursion due to inlining.
CREATE OR REPLACE FUNCTION public.is_project_department_manager(project_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_manager boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.departments d ON p.department_id = d.id
    WHERE p.id = project_uuid AND d.manager_id = user_uuid
  ) INTO is_manager;
  RETURN is_manager;
END;
$$;

-- ─── 4. Update Row Level Security ────────────────────────────────

-- Drop existing projects select policy
DROP POLICY IF EXISTS "projects_select" ON public.projects;

-- Create role-scoped projects select policy
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT
  USING (
    -- Admin role can see all
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Manager role can see projects in departments they manage, or where they are members
    ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' AND (
      department_id IN (SELECT id FROM public.departments WHERE manager_id = auth.uid())
      OR
      id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
    ))
    OR
    -- Employee role can see projects they are members of
    ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'employee' AND (
      id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
    ))
  );

-- Project Members Policies
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
CREATE POLICY "project_members_select" ON public.project_members
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "project_members_insert" ON public.project_members;
CREATE POLICY "project_members_insert" ON public.project_members
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' AND (
      is_project_department_manager(project_id, auth.uid())
    ))
  );

DROP POLICY IF EXISTS "project_members_delete" ON public.project_members;
CREATE POLICY "project_members_delete" ON public.project_members
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager' AND (
      is_project_department_manager(project_id, auth.uid())
    ))
  );

-- ─── 4. Seed and Map Existing Data ────────────────────────────────

-- Match existing projects to departments
UPDATE public.projects
SET department_id = '249f48b9-33ee-498f-a06e-6514394289f8' -- Full Stack
WHERE name IN ('MERN Stack Project', 'React Native Mobile App', 'Internal Tooling', 'Spectrum Health Care', 'Teqfocus Bench', 'HealthLatch');

UPDATE public.projects
SET department_id = '491714cf-8ce8-412b-a8cb-4cc2f62eac9e' -- Salesforce
WHERE name IN ('Salesforce Admin Project', 'Salesforce Development Project');

UPDATE public.projects
SET department_id = 'f64fd258-93b9-43c9-ac74-7aea1fee9957' -- System Engineer
WHERE name IN ('AWS Infrastructure Setup');

-- Automatically assign members based on past work logs (so no existing data gets lost/hidden)
INSERT INTO public.project_members (project_id, user_id)
SELECT DISTINCT project_id, user_id 
FROM public.work_logs 
WHERE project_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;
