import { LogCard } from '@/components/logs/LogCard'
import type { WorkLog, Project } from '@/lib/types'

interface LogGroupProps {
  label: string
  dateStr: string
  totalHours: number
  logs: WorkLog[]
  projects: Project[]
}

export function LogGroup({ label, dateStr, totalHours, logs, projects }: LogGroupProps) {
  return (
    <section>
      {/* Group header */}
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-background py-1 z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          <span className="text-xs text-muted-foreground">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
          <span>{totalHours.toFixed(1)}h</span>
          <span className="text-muted-foreground font-normal text-xs">total</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {logs.map((log) => (
          <LogCard key={log.id} log={log} projects={projects} />
        ))}
      </div>
    </section>
  )
}
