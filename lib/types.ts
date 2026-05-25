// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'manager' | 'admin'

export interface Department {
  id: string
  name: string
  code: string
  manager_id: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  manager?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  role: UserRole
  weekly_goal: number
  department_id: string | null
  is_active: boolean
  requires_password_change: boolean
  created_at: string
  updated_at: string
  // Joined
  department?: Pick<Department, 'id' | 'name' | 'code' | 'color'> | null
}

export interface TeamMemberDetails extends Profile {
  projects: Array<{ id: string; name: string; color: string; department_id: string | null }>
  weekly_hours: number
}

// ─── Projects (company-wide) ──────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  color: string
  is_active: boolean
  created_by: string | null
  department_id: string | null
  created_at: string
  updated_at: string
}

export interface ProjectWithDetails extends Project {
  department?: Pick<Department, 'id' | 'name' | 'code' | 'color'> | null
  members?: Array<Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>>
}

// ─── Work Logs ────────────────────────────────────────────────────────────────

export type WorkCategory =
  | 'on_project'
  | 'shadow'
  | 'bench'
  | 'leave'
  | 'training'
  | 'other_project_support'

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  on_project: 'On Project',
  shadow: 'Shadow',
  bench: 'Bench',
  leave: 'Leave',
  training: 'Training',
  other_project_support: 'Other Project Support',
}

export const CATEGORY_COLORS: Record<WorkCategory, string> = {
  on_project: '#4f46e5',
  shadow: '#8b5cf6',
  bench: '#f59e0b',
  leave: '#ef4444',
  training: '#22c55e',
  other_project_support: '#06b6d4',
}

export interface WorkLog {
  id: string
  user_id: string
  project_id: string | null
  date: string
  hours: number
  category: WorkCategory
  description: string | null
  created_at: string
  updated_at: string
  // Joined
  project?: Pick<Project, 'id' | 'name' | 'color'> | null
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'> | null
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DailyTrend {
  date: string
  hours: number
}

export interface CategorySplit {
  category: WorkCategory
  label: string
  hours: number
  color: string
}

export interface ProjectHours {
  project_id: string
  project_name: string
  color: string
  hours: number
}

export interface AnalyticsSummary {
  total_hours: number
  total_entries: number
  avg_hours_per_day: number
  most_worked_project: string | null
}

// ─── Forms ───────────────────────────────────────────────────────────────────

export interface CreateLogInput {
  project_id: string | null
  date: string
  hours: number
  category: WorkCategory
  description: string
}

export interface UpdateLogInput extends CreateLogInput {
  id: string
}
