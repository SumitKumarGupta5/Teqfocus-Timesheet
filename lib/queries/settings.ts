import { createClient } from '@/lib/server'
import type { Profile } from '@/lib/types'

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
