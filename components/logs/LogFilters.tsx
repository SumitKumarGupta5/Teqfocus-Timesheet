'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project } from '@/lib/types'
import { Calendar, Filter, FolderDot } from 'lucide-react'
import { useCallback } from 'react'

interface LogFiltersProps {
  projects: Project[]
}

export function LogFilters({ projects }: LogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentProject = searchParams.get('projectId') ?? 'all'
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentMonth = searchParams.get('month') ?? defaultMonth

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleProjectChange = (value: string) => {
    router.push(pathname + '?' + createQueryString('projectId', value))
  }

  const handleMonthChange = (value: string) => {
    router.push(pathname + '?' + createQueryString('month', value))
  }

  // Generate last 3 months (Current, Prev, Prev-Prev) using local time to avoid UTC shifts
  const months = Array.from({ length: 3 }).map((_, i) => {
    const d = new Date()
    d.setDate(1) // Avoid overflow
    d.setMonth(d.getMonth() - i)
    
    // Format as YYYY-MM using local components
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    
    return {
      value,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }
  })

  return (
    <div className="flex flex-wrap items-center gap-4 bg-accent/20 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
      {/* Month Selector */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-border/60 shadow-sm">
        <Calendar className="w-4 h-4 text-primary" />
        <Select value={currentMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="border-none bg-transparent h-7 p-0 focus:ring-0 w-[140px] font-bold text-[11px] uppercase tracking-wider cursor-pointer text-foreground">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl border-border/40">
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs font-bold uppercase tracking-wide text-foreground">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project Selector */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-border/60 shadow-sm">
        <FolderDot className="w-4 h-4 text-primary" />
        <Select value={currentProject} onValueChange={handleProjectChange}>
          <SelectTrigger className="border-none bg-transparent h-7 p-0 focus:ring-0 w-[160px] font-semibold text-xs uppercase tracking-wider cursor-pointer">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl border-border/40">
            <SelectItem value="all" className="text-xs font-bold uppercase tracking-wide italic">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-2 px-3 text-muted-foreground">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Active Filters</span>
      </div>
    </div>
  )
}
