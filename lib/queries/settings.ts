import { createClient } from '@/lib/server'
import type { Profile, TeamMemberDetails } from '@/lib/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Profile missing - attempt to lazy-create from Auth metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.id === userId) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: user.user_metadata?.full_name || 'New User',
          role: 'employee',
          weekly_goal: 40
        })
        .select()
        .single()
      
      if (!insertError) return newProfile as Profile
    }
  }

  if (error) return null
  return data as Profile
}

export async function getWeeklyHours(userId: string): Promise<number> {
  const supabase = await createClient()

  // Get start of current week (Monday)
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon...
  const diffToMonday = (day === 0 ? -6 : 1) - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const { data, error } = await supabase
    .from('work_logs')
    .select('hours')
    .eq('user_id', userId)
    .gte('date', monday.toISOString().split('T')[0])
    .lte('date', sunday.toISOString().split('T')[0])

  if (error || !data) return 0
  return data.reduce((sum, row) => sum + Number(row.hours), 0)
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  if (error || !data) return []
  return data as Profile[]
}

export async function getProfilesForManager(managerId: string): Promise<Profile[]> {
  const supabase = await createClient()

  // 1. Fetch departments managed by this user
  const { data: depts, error: deptsError } = await supabase
    .from('departments')
    .select('id')
    .eq('manager_id', managerId)

  if (deptsError || !depts || depts.length === 0) {
    // If they manage no departments, they can only see themselves
    const { data: selfProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', managerId)
      .single()
    return selfProfile ? [selfProfile as Profile] : []
  }

  const deptIds = depts.map((d) => d.id)

  // 2. Fetch manager's own profile and employees in their departments
  const [selfResult, employeesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', managerId)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .in('department_id', deptIds)
  ])

  const result: Profile[] = []
  if (selfResult.data) {
    result.push(selfResult.data as Profile)
  }
  if (employeesResult.data) {
    employeesResult.data.forEach((p) => {
      if (p.id !== managerId) {
        result.push(p as Profile)
      }
    })
  }

  // Sort alphabetically by full_name
  result.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
  return result
}

export async function getManagerTeamDetails(managerId: string): Promise<TeamMemberDetails[]> {
  const supabase = await createClient()

  // 1. Fetch departments managed by this user
  const { data: depts, error: deptsError } = await supabase
    .from('departments')
    .select('id, name, code, color')
    .eq('manager_id', managerId)

  if (deptsError || !depts || depts.length === 0) {
    return []
  }

  const deptIds = depts.map((d) => d.id)

  // 2. Fetch all employees in their departments (role = 'employee')
  const { data: employees, error: empError } = await supabase
    .from('profiles')
    .select('*, department:departments!profiles_department_id_fkey(id, name, code, color)')
    .eq('role', 'employee')
    .in('department_id', deptIds)
    .order('full_name', { ascending: true })

  if (empError || !employees || employees.length === 0) {
    return []
  }

  const employeeIds = employees.map((e) => e.id)

  // 3. Fetch project memberships for these employees
  const { data: memberships, error: memError } = await supabase
    .from('project_members')
    .select('user_id, project:projects(id, name, color, department_id)')
    .in('user_id', employeeIds)

  interface MembershipRow {
    user_id: string
    project: {
      id: string
      name: string
      color: string
      department_id: string | null
    } | null
  }

  const projectsByUser: Record<
    string,
    Array<{ id: string; name: string; color: string; department_id: string | null }>
  > = {}
  if (!memError && memberships) {
    (memberships as unknown as MembershipRow[]).forEach((m) => {
      if (m.project) {
        if (!projectsByUser[m.user_id]) {
          projectsByUser[m.user_id] = []
        }
        projectsByUser[m.user_id].push(m.project)
      }
    })
  }

  // 4. Fetch current week logged hours for these employees
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = (day === 0 ? -6 : 1) - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const { data: logs, error: logsError } = await supabase
    .from('work_logs')
    .select('user_id, hours')
    .in('user_id', employeeIds)
    .gte('date', monday.toISOString().split('T')[0])
    .lte('date', sunday.toISOString().split('T')[0])

  const hoursByUser: Record<string, number> = {}
  if (!logsError && logs) {
    logs.forEach((log) => {
      hoursByUser[log.user_id] = (hoursByUser[log.user_id] || 0) + Number(log.hours)
    })
  }

  // 5. Combine and construct TeamMemberDetails
  return employees.map((emp) => ({
    ...(emp as Profile),
    projects: projectsByUser[emp.id] || [],
    weekly_hours: hoursByUser[emp.id] || 0
  })) as TeamMemberDetails[]
}


