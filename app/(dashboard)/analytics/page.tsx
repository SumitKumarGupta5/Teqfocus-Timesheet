import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getDailyTrend, getCategorySplit, getProjectHours, getAnalyticsSummary } from '@/lib/queries/analytics'
import { getProjectsForUser } from '@/lib/queries/logs'
import { getAllProfiles, getProfilesForManager } from '@/lib/queries/settings'
import { LogFilters } from '@/components/logs/LogFilters'
import { StatCard } from '@/components/analytics/StatCard'
import { DailyTrendChart } from '@/components/analytics/DailyTrendChart'
import { CategoryDonutChart } from '@/components/analytics/CategoryDonutChart'
import { ProjectBarChart } from '@/components/analytics/ProjectBarChart'
import { Card } from '@/components/ui/card'
import { Clock, Hash, TrendingUp, FolderDot } from 'lucide-react'
import type { Metadata } from 'next'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Analytics',
}

function getMonthRange(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  return { startDate, endDate }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; projectId?: string; userId?: string }>
}) {
  const { month, projectId, userId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManagerOrAdmin = profile?.role === 'manager' || profile?.role === 'admin'

  // Fetch projects and profiles based on role permissions
  const [rawProjects, filteredProfiles] = await Promise.all([
    getProjectsForUser(user.id, profile?.role || 'employee'),
    (async () => {
      if (profile?.role === 'admin') {
        const rawProfiles = await getAllProfiles()
        return rawProfiles.filter(
          (p) => p.id === user.id || p.role === 'employee'
        )
      } else if (profile?.role === 'manager') {
        return getProfilesForManager(user.id)
      }
      return []
    })()
  ])

  // Resolve selectedUserId based on role and selections securely
  let selectedUserId: string | string[] | undefined = user.id

  if (profile?.role === 'admin') {
    if (userId === 'all') {
      selectedUserId = undefined
    } else if (userId) {
      const isAllowed = filteredProfiles.some((p) => p.id === userId)
      selectedUserId = isAllowed ? userId : user.id
    }
  } else if (profile?.role === 'manager') {
    if (userId === 'all') {
      selectedUserId = filteredProfiles.map((p) => p.id)
    } else if (userId) {
      const isAllowed = filteredProfiles.some((p) => p.id === userId)
      selectedUserId = isAllowed ? userId : user.id
    }
  }

  const baseFilter = {
    userId: selectedUserId,
    projectId: projectId === 'all' ? undefined : projectId,
  }

  // Calculate month range based on parameters
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentMonth = month ?? defaultMonth
  const { startDate: monthStart, endDate: monthEnd } = getMonthRange(currentMonth)

  const [summary, trend, categories, projects] = await Promise.all([
    getAnalyticsSummary({ ...baseFilter, startDate: monthStart, endDate: monthEnd }),
    getDailyTrend({ ...baseFilter, days: 7 }),
    getCategorySplit({ ...baseFilter, days: 30 }),
    getProjectHours({ ...baseFilter, days: 30 }),
  ])

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isManagerOrAdmin ? 'Team Analytics' : 'My Analytics'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Productivity insights and work trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogFilters
            projects={rawProjects as Project[]}
            profiles={filteredProfiles}
            isManagerOrAdmin={isManagerOrAdmin}
            currentUserId={user.id}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Hours"
          value={`${summary.total_hours}h`}
          icon={Clock}
          iconColor="#4f46e5"
          subtitle="This month"
        />
        <StatCard
          title="Total Entries"
          value={summary.total_entries}
          icon={Hash}
          iconColor="#22c55e"
          subtitle="This month"
        />
        <StatCard
          title="Avg / Day"
          value={`${summary.avg_hours_per_day}h`}
          icon={TrendingUp}
          iconColor="#f59e0b"
          subtitle="Hours per working day"
        />
        <StatCard
          title="Top Project"
          value={summary.most_worked_project ?? '—'}
          icon={FolderDot}
          iconColor="#06b6d4"
          subtitle="Most hours logged"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Daily trend - takes 2 cols */}
        <Card className="lg:col-span-2 p-5 border border-border rounded-xl">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Daily Work Trend</h2>
            <p className="text-xs text-muted-foreground">Last 7 days of activity</p>
          </div>
          <DailyTrendChart data={trend} />
        </Card>

        {/* Category split */}
        <Card className="p-5 border border-border rounded-xl">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Category Split</h2>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <CategoryDonutChart data={categories} />
        </Card>
      </div>

      {/* Project hours */}
      <Card className="p-5 border border-border rounded-xl">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Hours per Project</h2>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <ProjectBarChart data={projects} />
      </Card>
    </div>
  )
}
