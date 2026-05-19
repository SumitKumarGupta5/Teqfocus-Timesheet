'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function createProject(name: string, color: string = '#4f46e5') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Only admins can manage projects' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Project name is required' }

  const { error } = await supabase.from('projects').insert({
    name: trimmed,
    color,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  return { success: true }
}

export async function updateProject(id: string, name: string, color: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Only admins can manage projects' }

  const { error } = await supabase
    .from('projects')
    .update({ name: name.trim(), color, is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Only admins can manage projects' }

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  return { success: true }
}
