import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getDailyTrend, getCategorySplit, getProjectHours, getAnalyticsSummary } from '@/lib/queries/analytics'
import { StatCard } from '@/components/analytics/StatCard'
import { DailyTrendChart } from '@/components/analytics/DailyTrendChart'
import { CategoryDonutChart } from '@/components/analytics/CategoryDonutChart'
import { ProjectBarChart } from '@/components/analytics/ProjectBarChart'
import { Card } from '@/components/ui/card'
import { Clock, Hash, TrendingUp, FolderDot } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics',
}

export default async function AnalyticsPage() {
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
  const baseFilter = isManagerOrAdmin ? {} : { userId: user.id }

  // Calculate current month range
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [summary, trend, categories, projects] = await Promise.all([
    getAnalyticsSummary({ ...baseFilter, startDate: monthStart, endDate: monthEnd }),
    getDailyTrend({ ...baseFilter, days: 7 }),
    getCategorySplit({ ...baseFilter, days: 30 }),
    getProjectHours({ ...baseFilter, days: 30 }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {isManagerOrAdmin ? 'Team Analytics' : 'My Analytics'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Productivity insights and work trends
        </p>
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
