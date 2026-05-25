'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function createProject(name: string, color: string = '#4f46e5', departmentId: string | null = null) {
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
    department_id: departmentId,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  revalidatePath('/organisation/projects')
  revalidatePath('/projects')
  return { success: true }
}

export async function updateProject(id: string, name: string, color: string, isActive: boolean, departmentId: string | null = null) {
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
    .update({ 
      name: name.trim(), 
      color, 
      is_active: isActive, 
      department_id: departmentId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  revalidatePath('/organisation/projects')
  revalidatePath('/projects')
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
  revalidatePath('/organisation/projects')
  revalidatePath('/projects')
  return { success: true }
}

export async function addProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  if (profile.role !== 'admin' && profile.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  // If manager, check if they manage the project's department
  if (profile.role === 'manager') {
    const { data: project } = await supabase
      .from('projects')
      .select('department_id')
      .eq('id', projectId)
      .single()

    if (!project || !project.department_id) {
      return { error: 'Unauthorized: Project has no department assigned' }
    }

    const { data: dept } = await supabase
      .from('departments')
      .select('manager_id')
      .eq('id', project.department_id)
      .single()

    if (!dept || dept.manager_id !== user.id) {
      return { error: 'Unauthorized: You are not the manager of this project\'s department' }
    }
  }

  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId })

  if (error) {
    if (error.code === '23505') {
      return { error: 'User is already a member of this project' }
    }
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/logs')
  revalidatePath('/organisation/projects')
  revalidatePath('/projects')
  return { success: true }
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  if (profile.role !== 'admin' && profile.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  // If manager, check if they manage the project's department
  if (profile.role === 'manager') {
    const { data: project } = await supabase
      .from('projects')
      .select('department_id')
      .eq('id', projectId)
      .single()

    if (!project || !project.department_id) {
      return { error: 'Unauthorized: Project has no department assigned' }
    }

    const { data: dept } = await supabase
      .from('departments')
      .select('manager_id')
      .eq('id', project.department_id)
      .single()

    if (!dept || dept.manager_id !== user.id) {
      return { error: 'Unauthorized: You are not the manager of this project\'s department' }
    }
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/logs')
  revalidatePath('/organisation/projects')
  revalidatePath('/projects')
  return { success: true }
}
