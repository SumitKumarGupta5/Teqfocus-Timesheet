-- ═══════════════════════════════════════════════════════════════
-- Employee Worklog Tracker — AI Productivity Insights Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.worklog_insights (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month               text        NOT NULL, -- format: 'YYYY-MM'
  employee_insights   text        NOT NULL,
  manager_insights    text        NOT NULL,
  shared_insights     text        NOT NULL,
  productivity_score  integer     NOT NULL CHECK (productivity_score >= 0 AND productivity_score <= 100),
  burnout_risk        text        NOT NULL CHECK (burnout_risk IN ('Low', 'Medium', 'High')),
  strengths           jsonb       NOT NULL DEFAULT '[]'::jsonb,
  improvement         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  next_month_goals    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.worklog_insights ENABLE ROW LEVEL SECURITY;

-- ─── Policies ──────────────────────────────────────────────────

-- 1. Select Policy: Employees can view their own insights; managers and admins can view all.
CREATE POLICY "worklog_insights_select"
  ON public.worklog_insights FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'admin')
  );

-- 2. Insert Policy: Employees can insert their own; managers and admins can insert for anyone.
CREATE POLICY "worklog_insights_insert"
  ON public.worklog_insights FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'admin')
  );

-- 3. Update Policy: Employees can update their own; managers and admins can update for anyone.
CREATE POLICY "worklog_insights_update"
  ON public.worklog_insights FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'admin')
  );

-- 4. Delete Policy: Employees can delete their own; managers and admins can delete for anyone.
CREATE POLICY "worklog_insights_delete"
  ON public.worklog_insights FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('manager', 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- Automated Monthly Cron Job Configuration
-- Run this in your Supabase SQL Editor AFTER deploying your app.
-- Replace <YOUR_APP_URL> and <YOUR_CRON_SECRET> with your config.
-- ═══════════════════════════════════════════════════════════════
/*
-- 1. Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Schedule cron job for 00:00 on the 25th of every month
SELECT cron.schedule(
  'generate-monthly-worklog-insights',
  '0 0 25 * *',
  $$
  SELECT net.http_get(
    url := 'https://<YOUR_APP_URL>/api/cron/insights',
    headers := jsonb_build_object('Authorization', 'Bearer <YOUR_CRON_SECRET>')
  );
  $$
);
*/
