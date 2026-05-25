import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/queries/settings'
import { getProjectsWithDetails } from '@/lib/queries/logs'
import { getDepartments } from '@/lib/queries/organisation'
import { ProjectsClient } from './ProjectsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects Management',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== 'admin') {
    redirect('/logs')
  }

  const projects = await getProjectsWithDetails()
  const departments = await getDepartments()

  return <ProjectsClient initialProjects={projects} departments={departments} />
}
