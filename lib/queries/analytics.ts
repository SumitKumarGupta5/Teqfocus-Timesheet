import { createClient } from '@/lib/server'
import type { DailyTrend, CategorySplit, ProjectHours, AnalyticsSummary } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'

interface AnalyticsFilter {
  userId?: string | string[]   // support array for manager scope
  projectId?: string // filter by project ID
  days?: number     // default: 30
  startDate?: string // ISO date string (YYYY-MM-DD)
  endDate?: string   // ISO date string (YYYY-MM-DD)
}

export async function getDailyTrend(filter: AnalyticsFilter = {}): Promise<DailyTrend[]> {
  const supabase = await createClient()
  const days = filter.days ?? 7

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  let query = supabase
    .from('work_logs')
    .select('date, hours')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  if (filter.userId) {
    if (Array.isArray(filter.userId)) {
      query = query.in('user_id', filter.userId)
    } else {
      query = query.eq('user_id', filter.userId)
    }
  }

  if (filter.projectId) {
    query = query.eq('project_id', filter.projectId)
  }

  const { data, error } = await query
  if (error || !data) return []

  // Group by date
  const map = new Map<string, number>()
  data.forEach((row) => {
    map.set(row.date, (map.get(row.date) ?? 0) + Number(row.hours))
  })

  // Fill every day in range
  const result: DailyTrend[] = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().split('T')[0]
    result.push({ date: dateStr, hours: Math.round((map.get(dateStr) ?? 0) * 10) / 10 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

export async function getCategorySplit(filter: AnalyticsFilter = {}): Promise<CategorySplit[]> {
  const supabase = await createClient()
  const days = filter.days ?? 30

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  let query = supabase
    .from('work_logs')
    .select('category, hours')
    .gte('date', startDate.toISOString().split('T')[0])

  if (filter.userId) {
    if (Array.isArray(filter.userId)) {
      query = query.in('user_id', filter.userId)
    } else {
      query = query.eq('user_id', filter.userId)
    }
  }

  if (filter.projectId) {
    query = query.eq('project_id', filter.projectId)
  }

  const { data, error } = await query
  if (error || !data) return []

  const map = new Map<string, number>()
  data.forEach((row) => {
    map.set(row.category, (map.get(row.category) ?? 0) + Number(row.hours))
  })

  return Array.from(map.entries()).map(([category, hours]) => ({
    category: category as CategorySplit['category'],
    label: CATEGORY_LABELS[category as CategorySplit['category']] ?? category,
    hours: Math.round(hours * 10) / 10,
    color: CATEGORY_COLORS[category as CategorySplit['category']] ?? '#94a3b8',
  }))
}

export async function getProjectHours(filter: AnalyticsFilter = {}): Promise<ProjectHours[]> {
  const supabase = await createClient()
  const days = filter.days ?? 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  let query = supabase
    .from('work_logs')
    .select('hours, project:projects(id, name, color)')
    .gte('date', startDate.toISOString().split('T')[0])
    .not('project_id', 'is', null)

  if (filter.userId) {
    if (Array.isArray(filter.userId)) {
      query = query.in('user_id', filter.userId)
    } else {
      query = query.eq('user_id', filter.userId)
    }
  }

  if (filter.projectId) {
    query = query.eq('project_id', filter.projectId)
  }

  const { data, error } = await query
  if (error || !data) return []

  const map = new Map<string, { name: string; color: string; hours: number }>()
  ;(data as unknown as Array<{ hours: number; project: { id: string; name: string; color: string } | null }>)
    .forEach((row) => {
      if (!row.project) return
      const existing = map.get(row.project.id)
      map.set(row.project.id, {
        name: row.project.name,
        color: row.project.color,
        hours: (existing?.hours ?? 0) + Number(row.hours),
      })
    })

  return Array.from(map.entries())
    .map(([project_id, v]) => ({
      project_id,
      project_name: v.name,
      color: v.color,
      hours: Math.round(v.hours * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8)
}

export async function getAnalyticsSummary(filter: AnalyticsFilter = {}): Promise<AnalyticsSummary> {
  const supabase = await createClient()

  let query = supabase.from('work_logs').select('hours, date, project:projects(name)')

  if (filter.userId) {
    if (Array.isArray(filter.userId)) {
      query = query.in('user_id', filter.userId)
    } else {
      query = query.eq('user_id', filter.userId)
    }
  }

  if (filter.projectId) {
    query = query.eq('project_id', filter.projectId)
  }

  if (filter.startDate) {
    query = query.gte('date', filter.startDate)
  }

  if (filter.endDate) {
    query = query.lte('date', filter.endDate)
  }

  const { data, error } = await query
  if (error || !data) {
    return { total_hours: 0, total_entries: 0, avg_hours_per_day: 0, most_worked_project: null }
  }

  const rows = data as unknown as Array<{
    hours: number
    date: string
    project: { name: string } | null
  }>

  const total_hours = rows.reduce((s, r) => s + Number(r.hours), 0)
  const total_entries = rows.length
  const uniqueDays = new Set(rows.map((r) => r.date)).size
  const avg_hours_per_day = uniqueDays > 0 ? Math.round((total_hours / uniqueDays) * 10) / 10 : 0

  const projectMap = new Map<string, number>()
  rows.forEach((r) => {
    if (!r.project?.name) return
    projectMap.set(r.project.name, (projectMap.get(r.project.name) ?? 0) + Number(r.hours))
  })
  const most_worked_project =
    Array.from(projectMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    total_hours: Math.round(total_hours * 10) / 10,
    total_entries,
    avg_hours_per_day,
    most_worked_project,
  }
}
