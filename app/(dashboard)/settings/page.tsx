import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getProfile, getWeeklyHours } from '@/lib/queries/settings'
import { getProjects } from '@/lib/queries/logs'
import { getAllProfiles } from '@/lib/queries/settings'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { WeeklyGoalForm } from '@/components/settings/WeeklyGoalForm'
import { ProjectManager } from '@/components/settings/ProjectManager'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [profile, weeklyHours, projects] = await Promise.all([
    getProfile(user.id),
    getWeeklyHours(user.id),
    getProjects(),
  ])

  if (!profile) redirect('/auth/login')

  const isAdmin = profile.role === 'admin'
  let allProfiles = null
  if (isAdmin) {
    allProfiles = await getAllProfiles()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <Card className="p-6 border border-border rounded-xl">
          <h2 className="text-base font-semibold text-foreground mb-1">Profile</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Update your display name
          </p>
          <ProfileForm profile={profile} />
        </Card>

        {/* Weekly Goal */}
        <Card className="p-6 border border-border rounded-xl">
          <h2 className="text-base font-semibold text-foreground mb-1">Weekly Goal</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Set your target hours per week (default: 40h)
          </p>
          <WeeklyGoalForm profile={profile} currentWeeklyHours={weeklyHours} />
        </Card>

        {/* Projects */}
        <Card className="p-6 border border-border rounded-xl">
          <h2 className="text-base font-semibold text-foreground mb-1">Projects</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isAdmin
              ? 'Manage company-wide projects available to all employees'
              : 'View company-wide projects (managed by Admin)'}
          </p>
          <ProjectManager
            projects={projects as Project[]}
            isAdmin={isAdmin}
          />
        </Card>

        {/* User Management — Admin only */}
        {isAdmin && allProfiles && (
          <Card className="p-6 border border-border rounded-xl">
            <h2 className="text-base font-semibold text-foreground mb-1">Team Members</h2>
            <p className="text-sm text-muted-foreground mb-5">
              All registered users and their roles
            </p>
            <div className="flex flex-col gap-2">
              {allProfiles.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {p.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.full_name ?? 'Unnamed user'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              To change a user&apos;s role, update it directly in the Supabase Dashboard → profiles table.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
