import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getProfile, getProfilesForManager } from '@/lib/queries/settings'
import { getManagedProjects } from '@/lib/queries/logs'
import { ManagerProjectsClient } from './ManagerProjectsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects - Manager Dashboard',
}

export default async function ManagerProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  
  // Scoping check: Only managers (and admins, who can view the admin console) can access this page
  // If employee, redirect to /logs
  if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
    redirect('/logs')
  }

  // Fetch projects matching the manager's department(s)
  const managedProjects = await getManagedProjects(user.id)

  // Fetch employees under this manager's department(s)
  const eligibleEmployees = await getProfilesForManager(user.id)

  return (
    <ManagerProjectsClient
      initialProjects={managedProjects}
      eligibleEmployees={eligibleEmployees.filter(emp => emp.id !== user.id)}
    />
  )
}
