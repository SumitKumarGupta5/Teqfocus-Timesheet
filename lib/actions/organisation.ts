'use server'

import { createClient } from '@/lib/server'
import { createAdminClient } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// Helper to assert current user is admin
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required')
  }
  return supabase
}

/**
 * Creates a new department. (Admin-only)
 */
export async function createDepartment(input: {
  name: string
  code: string
  manager_id: string | null
  color: string
  is_active: boolean
}) {
  try {
    const supabase = await checkAdmin()
    
    const name = input.name.trim()
    const code = input.code.trim().toUpperCase()
    
    if (!name) return { error: 'Name is required' }
    if (!code) return { error: 'Code is required' }

    const { data, error } = await supabase
      .from('departments')
      .insert({
        name,
        code,
        manager_id: input.manager_id || null,
        color: input.color,
        is_active: input.is_active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/organisation/departments')
    revalidatePath('/organisation/users')
    return { success: true, department: data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

/**
 * Updates an existing department. (Admin-only)
 */
export async function updateDepartment(
  id: string,
  input: {
    name: string
    code: string
    manager_id: string | null
    color: string
    is_active: boolean
  }
) {
  try {
    const supabase = await checkAdmin()

    const name = input.name.trim()
    const code = input.code.trim().toUpperCase()

    if (!name) return { error: 'Name is required' }
    if (!code) return { error: 'Code is required' }

    const { error } = await supabase
      .from('departments')
      .update({
        name,
        code,
        manager_id: input.manager_id || null,
        color: input.color,
        is_active: input.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/organisation/departments')
    revalidatePath('/organisation/users')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

/**
 * Deletes a department. (Admin-only)
 */
export async function deleteDepartment(id: string) {
  try {
    const supabase = await checkAdmin()

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/organisation/departments')
    revalidatePath('/organisation/users')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

/**
 * Administrative user creation in Auth and profiles. (Admin-only)
 */
export async function createUserAdmin(input: {
  fullName: string
  email: string
  password?: string
  role: 'employee' | 'manager' | 'admin'
  weeklyGoal: number
  departmentId: string | null
  isActive: boolean
}) {
  try {
    await checkAdmin()

    const email = input.email.trim()
    const fullName = input.fullName.trim()
    const password = input.password?.trim()

    if (!email) return { error: 'Email is required' }
    if (!fullName) return { error: 'Name is required' }
    if (!password) return { error: 'Temporary password is required' }

    const supabaseAdmin = createAdminClient()

    // Create user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Failed to create authentication account' }

    // Update the automatically created profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: input.role,
        weekly_goal: input.weeklyGoal,
        department_id: input.departmentId || null,
        is_active: input.isActive,
        requires_password_change: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Error updating created profile:', profileError)
      return { error: `User created, but profile update failed: ${profileError.message}` }
    }

    revalidatePath('/organisation/users')
    revalidatePath('/organisation/departments')
    revalidatePath('/settings')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

/**
 * Updates a user's details as an Admin. (Admin-only)
 */
export async function updateUserAdmin(
  userId: string,
  input: {
    role?: 'employee' | 'manager' | 'admin'
    weeklyGoal?: number
    departmentId?: string | null
    isActive?: boolean
  }
) {
  try {
    const supabase = await checkAdmin()

    const updates: {
      updated_at: string
      role?: 'employee' | 'manager' | 'admin'
      weekly_goal?: number
      department_id?: string | null
      is_active?: boolean
    } = {
      updated_at: new Date().toISOString()
    }
    if (input.role !== undefined) updates.role = input.role
    if (input.weeklyGoal !== undefined) updates.weekly_goal = input.weeklyGoal
    if (input.departmentId !== undefined) updates.department_id = input.departmentId
    if (input.isActive !== undefined) updates.is_active = input.isActive

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/organisation/users')
    revalidatePath('/organisation/departments')
    revalidatePath('/settings')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}
