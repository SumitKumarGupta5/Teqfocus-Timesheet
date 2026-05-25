import { createClient } from '@/lib/server'
import type { Profile, Department } from '@/lib/types'

/**
 * Fetches all user profiles with their assigned department details, ordered alphabetically.
 */
export async function getOrganisationProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, department:departments!profiles_department_id_fkey(id, name, code, color)')
    .order('full_name', { ascending: true })

  if (error || !data) {
    console.error('Error fetching organisation profiles:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    })
    return []
  }
  return data as Profile[]
}

/**
 * Fetches all departments with their assigned manager profiles, ordered by name.
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*, manager:profiles!departments_manager_id_fkey(id, full_name, avatar_url)')
    .order('name', { ascending: true })

  if (error || !data) {
    console.error('Error fetching departments:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    })
    return []
  }
  return data as Department[]
}
