import { createClient } from '@/lib/server'
import type { WorkLog } from '@/lib/types'

export interface LogsFilter {
  userId?: string | string[] // undefined = all (manager/admin)
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
    if (Array.isArray(filter.userId)) {
      query = query.in('user_id', filter.userId)
    } else {
      query = query.eq('user_id', filter.userId)
    }
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

import type { ProjectWithDetails } from '@/lib/types'

export async function getProjectsForUser(userId: string, role: string) {
  const supabase = await createClient()

  if (role === 'admin') {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error || !data) return []
    return data
  } else if (role === 'manager') {
    const { data: depts } = await supabase
      .from('departments')
      .select('id')
      .eq('manager_id', userId)
    const deptIds = depts?.map(d => d.id) || []

    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
    const memberProjIds = memberships?.map(m => m.project_id) || []

    if (deptIds.length === 0 && memberProjIds.length === 0) {
      return []
    }

    let query = supabase.from('projects').select('*').eq('is_active', true)
    
    const filterConditions = []
    if (deptIds.length > 0) {
      filterConditions.push(`department_id.in.(${deptIds.join(',')})`)
    }
    if (memberProjIds.length > 0) {
      filterConditions.push(`id.in.(${memberProjIds.join(',')})`)
    }

    query = query.or(filterConditions.join(','))
    const { data, error } = await query.order('name', { ascending: true })
    if (error || !data) return []
    return data
  } else {
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
    const projIds = memberships?.map(m => m.project_id) || []

    if (projIds.length === 0) return []

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .in('id', projIds)
      .order('name', { ascending: true })

    if (error || !data) return []
    return data
  }
}

export async function getProjectsWithDetails(): Promise<ProjectWithDetails[]> {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      department:departments(id, name, code, color)
    `)
    .order('name', { ascending: true })

  if (error || !projects) return []

  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select(`
      project_id,
      user:profiles(id, full_name, avatar_url, role)
    `)

  if (membersError || !members) {
    return projects.map(p => ({ ...p, members: [] })) as ProjectWithDetails[]
  }

  interface MemberWithProfile {
    project_id: string
    user: {
      id: string
      full_name: string | null
      avatar_url: string | null
      role: string
    } | null
  }

  const typedMembers = members as unknown as MemberWithProfile[]
  const membersByProject: Record<string, Array<{ id: string; full_name: string | null; avatar_url: string | null; role: string }>> = {}
  
  typedMembers.forEach((m) => {
    if (m.user) {
      if (!membersByProject[m.project_id]) {
        membersByProject[m.project_id] = []
      }
      membersByProject[m.project_id].push(m.user)
    }
  })

  return projects.map(p => ({
    ...p,
    members: membersByProject[p.id] || []
  })) as ProjectWithDetails[]
}

export async function getManagedProjects(managerId: string): Promise<ProjectWithDetails[]> {
  const supabase = await createClient()

  const { data: depts } = await supabase
    .from('departments')
    .select('id')
    .eq('manager_id', managerId)
  const deptIds = depts?.map(d => d.id) || []

  const { data: memberships } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', managerId)
  const memberProjIds = memberships?.map(m => m.project_id) || []

  if (deptIds.length === 0 && memberProjIds.length === 0) {
    return []
  }

  let query = supabase.from('projects').select(`
    *,
    department:departments(id, name, code, color)
  `)

  const filterConditions = []
  if (deptIds.length > 0) {
    filterConditions.push(`department_id.in.(${deptIds.join(',')})`)
  }
  if (memberProjIds.length > 0) {
    filterConditions.push(`id.in.(${memberProjIds.join(',')})`)
  }

  query = query.or(filterConditions.join(','))
  const { data: projects, error } = await query.order('name', { ascending: true })
  if (error || !projects) return []

  const projectIds = projects.map(p => p.id)
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select(`
      project_id,
      user:profiles(id, full_name, avatar_url, role)
    `)
    .in('project_id', projectIds)

  if (membersError || !members) {
    return projects.map(p => ({ ...p, members: [] })) as ProjectWithDetails[]
  }

  interface ManagedMemberWithProfile {
    project_id: string
    user: {
      id: string
      full_name: string | null
      avatar_url: string | null
      role: string
    } | null
  }

  const typedMembers = members as unknown as ManagedMemberWithProfile[]
  const membersByProject: Record<string, Array<{ id: string; full_name: string | null; avatar_url: string | null; role: string }>> = {}
  
  typedMembers.forEach((m) => {
    if (m.user) {
      if (!membersByProject[m.project_id]) {
        membersByProject[m.project_id] = []
      }
      membersByProject[m.project_id].push(m.user)
    }
  })

  return projects.map(p => ({
    ...p,
    members: membersByProject[p.id] || []
  })) as ProjectWithDetails[]
}

