import { createClient } from '@/lib/server'
import type { WorkLog } from '@/lib/types'

export interface LogsFilter {
  userId?: string     // undefined = all (manager/admin)
  startDate?: string  // ISO date string
  endDate?: string
  projectId?: string
}

export async function getWorkLogs(filter: LogsFilter = {}): Promise<WorkLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('work_logs')
    .select(
      `
      *,
      project:projects(id, name, color),
      profile:profiles(id, full_name, avatar_url, role)
      `
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filter.userId) {
    query = query.eq('user_id', filter.userId)
  }
  if (filter.startDate) {
    query = query.gte('date', filter.startDate)
  }
  if (filter.endDate) {
    query = query.lte('date', filter.endDate)
  }
  if (filter.projectId) {
    query = query.eq('project_id', filter.projectId)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as unknown as WorkLog[]
}

export async function getWorkLogById(id: string): Promise<WorkLog | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_logs')
    .select(
      `
      *,
      project:projects(id, name, color),
      profile:profiles(id, full_name, avatar_url, role)
      `
    )
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as WorkLog
}

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data) return []
  return data
}
