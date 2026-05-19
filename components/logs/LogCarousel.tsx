'use client'

import * as React from 'react'
import { DailyLogCard } from './DailyLogCard'
import type { WorkLog, Project } from '@/lib/types'

interface LogCarouselProps {
  logs: WorkLog[]
  projects: Project[]
}

export function LogCarousel({ logs, projects }: LogCarouselProps) {
  // Group logs by date
  const grouped = React.useMemo(() => {
    const map = new Map<string, WorkLog[]>()
    // Sort logs by date descending first to get the most recent days
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date))
    
    for (const log of sortedLogs) {
      const existing = map.get(log.date) ?? []
      map.set(log.date, [...existing, log])
    }
    return map
  }, [logs])

  const sortedDates = React.useMemo(() => {
    return Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))
  }, [grouped])

  if (sortedDates.length === 0) return null

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground/95">Daily Logs History</h2>
          <p className="text-sm text-muted-foreground font-semibold mt-1">Explore and review your recent professional contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {sortedDates.map((date) => {
          const dateLogs = grouped.get(date) ?? []
          const totalHours = dateLogs.reduce((sum, log) => sum + Number(log.hours), 0)
          
          return (
            <div key={date} className="w-full">
              <DailyLogCard
                date={date}
                logs={dateLogs}
                totalHours={totalHours}
                projects={projects}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
