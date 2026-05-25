import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/queries/settings'
import { getOrganisationProfiles, getDepartments } from '@/lib/queries/organisation'
import { UsersClient } from './UsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users Management',
}

export default async function UsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== 'admin') {
    redirect('/logs')
  }

  const profiles = await getOrganisationProfiles()
  const departments = await getDepartments()

  return <UsersClient initialProfiles={profiles} departments={departments} />
}
