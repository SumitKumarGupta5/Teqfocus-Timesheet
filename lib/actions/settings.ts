'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(fullName: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const trimmed = fullName.trim()
  if (!trimmed) return { error: 'Name is required' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}

export async function updateWeeklyGoal(goal: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!goal || goal < 1 || goal > 168) {
    return { error: 'Goal must be between 1 and 168 hours' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ weekly_goal: Math.round(goal), updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  return { success: true }
}

export async function updateUserRole(targetUserId: string, role: 'employee' | 'manager' | 'admin') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Only admins can change roles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Only admins can change roles' }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}
