'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'
import type { CreateLogInput, UpdateLogInput } from '@/lib/types'

export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Server-side validation
  if (!input.date) return { error: 'Date is required' }
  if (!input.hours || input.hours <= 0 || input.hours > 24) {
    return { error: 'Hours must be between 0.1 and 24' }
  }
  if (!input.category) return { error: 'Category is required' }

  const { error } = await supabase.from('work_logs').insert({
    user_id: user.id,
    project_id: input.project_id || null,
    date: input.date,
    hours: input.hours,
    category: input.category,
    description: input.description || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}

export async function updateLog(input: UpdateLogInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  if (!input.hours || input.hours <= 0 || input.hours > 24) {
    return { error: 'Hours must be between 0.1 and 24' }
  }

  // RLS ensures user can only update their own logs
  const { error } = await supabase
    .from('work_logs')
    .update({
      project_id: input.project_id || null,
      date: input.date,
      hours: input.hours,
      category: input.category,
      description: input.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}

export async function deleteLog(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // RLS ensures user can only delete their own logs (admins can delete any via policy)
  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/logs')
  revalidatePath('/analytics')
  return { success: true }
}
