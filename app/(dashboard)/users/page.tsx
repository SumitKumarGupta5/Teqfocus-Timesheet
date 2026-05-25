import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getProfile, getManagerTeamDetails } from '@/lib/queries/settings'
import { getDepartments } from '@/lib/queries/organisation'
import { ManagerUsersClient } from './ManagerUsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team Directory',
}

export default async function ManagerUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
    redirect('/logs')
  }

  const team = await getManagerTeamDetails(user.id)
  const departments = await getDepartments()
  const managedDepts = departments.filter(d => d.manager_id === user.id)

  return <ManagerUsersClient initialTeam={team} departments={managedDepts} />
}
