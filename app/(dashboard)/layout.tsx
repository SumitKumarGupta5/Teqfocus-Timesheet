import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { getProfile, getWeeklyHours } from '@/lib/queries/settings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Work Log',
    default: 'Work Log',
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profile, weeklyHours] = await Promise.all([
    getProfile(user.id),
    getWeeklyHours(user.id),
  ])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar profile={profile} weeklyHours={weeklyHours} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar profile={profile} weeklyHours={weeklyHours} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
