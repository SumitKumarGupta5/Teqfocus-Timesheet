import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { getWorkLogs, getProjects } from '@/lib/queries/logs'
import { LogDialog } from '@/components/logs/LogDialog'
import { LogCarousel } from '@/components/logs/LogCarousel'
import { LogFilters } from '@/components/logs/LogFilters'
import { ClipboardX, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import type { WorkLog, Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Work Logs',
}

function groupLogsByDate(logs: WorkLog[]): Map<string, WorkLog[]> {
  const groups = new Map<string, WorkLog[]>()
  for (const log of logs) {
    const existing = groups.get(log.date) ?? []
    groups.set(log.date, [...existing, log])
  }
  return groups
}

function getMonthRange(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  return { startDate, endDate }
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; projectId?: string }>
}) {
  const { month, projectId } = await searchParams
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

  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentMonth = month ?? defaultMonth
  const { startDate, endDate } = getMonthRange(currentMonth)

  const [logs, projects] = await Promise.all([
    getWorkLogs({
      userId: isManagerOrAdmin ? undefined : user.id,
      startDate,
      endDate,
      projectId: projectId === 'all' ? undefined : projectId,
    }),
    getProjects(),
  ])

  const grouped = groupLogsByDate(logs)
  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-12">
      {/* Page Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isManagerOrAdmin ? 'Work Log Explorer' : 'My Activity Journal'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Review and manage your daily contributions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogFilters projects={projects as Project[]} />
          <LogDialog projects={projects as Project[]} />
        </div>
      </div>

      {/* AI Productivity Insights */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary/5 via-accent/30 to-background border border-border/50 p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-accent/40 blur-2xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="shrink-0 p-3 rounded-2xl bg-background border border-border text-primary shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              AI Productivity Insights
            </h2>
            <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed font-medium">
              During this month, the employee demonstrated strong performance as a Full Stack Developer, completing 24 assigned tasks with an on-time delivery rate of 96%. The primary focus was the web application enhancement project, contributing over 120 development hours across frontend and backend modules. A key achievement was the successful implementation of the user management module, reducing API response time by 35%. The employee also completed Docker learning and applied containerization in development workflows, improving deployment efficiency by 25%. Collaboration, code quality, and responsiveness remained consistently strong throughout the month.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Carousel Section */}
      {sortedDates.length > 0 ? (
        <section className="bg-gradient-to-br from-accent/30 to-background p-8 rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
          <LogCarousel logs={logs} projects={projects as Project[]} />
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-accent/10 rounded-[32px] border-2 border-dashed border-border/50">
          <ClipboardX className="w-16 h-16 text-muted-foreground/20 mb-6" />
          <p className="text-lg font-bold text-foreground mb-2">No activity found for this selection</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your filters or record a new entry for this period.
          </p>
        </div>
      )}
    </div>
  )
}
