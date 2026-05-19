'use client'

import { useState, useTransition, ComponentType } from 'react'
import { toast } from 'sonner'
import { Briefcase, Users, Coffee, Calendar, GraduationCap, HelpCircle, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { createLog, updateLog } from '@/lib/actions/logs'
import type { WorkLog, Project, WorkCategory } from '@/lib/types'

interface LogFormProps {
  projects: Project[]
  initialData?: WorkLog
  onSuccess?: () => void
}

const CATEGORY_STYLES: Record<
  WorkCategory,
  {
    label: string
    desc: string
    icon: ComponentType<{ className?: string }>
    iconColorActive: string
  }
> = {
  on_project: {
    label: 'On Project',
    desc: 'Active client tasks',
    icon: Briefcase,
    iconColorActive: 'text-blue-600 dark:text-blue-400',
  },
  shadow: {
    label: 'Shadowing',
    desc: 'Learning from peers',
    icon: Users,
    iconColorActive: 'text-purple-600 dark:text-purple-400',
  },
  bench: {
    label: 'Bench Time',
    desc: 'Awaiting assignment',
    icon: Coffee,
    iconColorActive: 'text-amber-600 dark:text-amber-400',
  },
  leave: {
    label: 'Leave / PTO',
    desc: 'Approved time-off',
    icon: Calendar,
    iconColorActive: 'text-red-600 dark:text-red-400',
  },
  training: {
    label: 'Training',
    desc: 'Courses & certificates',
    icon: GraduationCap,
    iconColorActive: 'text-green-600 dark:text-green-400',
  },
  other_project_support: {
    label: 'Support',
    desc: 'Team support tasks',
    icon: HelpCircle,
    iconColorActive: 'text-cyan-600 dark:text-cyan-400',
  },
}

export function LogForm({ projects, initialData, onSuccess }: LogFormProps) {
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - offsetDays)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayLocalDate = getLocalDateString(0)
  const yesterdayLocalDate = getLocalDateString(1)

  const [isPending, startTransition] = useTransition()

  const [date, setDate] = useState(initialData?.date ?? todayLocalDate)
  const [hours, setHours] = useState(initialData?.hours?.toString() ?? '')
  const [category, setCategory] = useState<WorkCategory>(initialData?.category ?? 'on_project')
  const [projectId, setProjectId] = useState(initialData?.project_id ?? '__none__')
  const [description, setDescription] = useState(initialData?.description ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum <= 0) {
      toast.error('Please enter a valid number of hours')
      return
    }

    if (hoursNum > 12) {
      toast.error('Daily work hours cannot exceed 12 hours')
      return
    }

    // Determine if project selection is relevant for this category
    const isProjectRelevant = category === 'on_project' || category === 'other_project_support' || category === 'shadow'
    const payload = {
      date,
      hours: hoursNum,
      category,
      project_id: isProjectRelevant && projectId !== '__none__' ? projectId : null,
      description,
    }

    startTransition(async () => {
      const result = initialData
        ? await updateLog({ ...payload, id: initialData.id })
        : await createLog(payload)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(initialData ? 'Log updated' : 'Log entry added!')
        onSuccess?.()
      }
    })
  }

  const isProjectRelevant = category === 'on_project' || category === 'other_project_support' || category === 'shadow'

  return (
    <form id="log-form" onSubmit={handleSubmit} className="space-y-5 py-1">
      
      {/* ROW 1: Category & Project Side-by-Side Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Category Selector with Radio Icons */}
        <div className="space-y-2">
          <Label htmlFor="log-category" className="text-[13px] font-bold text-foreground/90 ml-0.5">
            Activity Category
          </Label>
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val as WorkCategory)
              // Auto-reset project dropdown selection if not project-relevant
              if (val !== 'on_project' && val !== 'other_project_support' && val !== 'shadow') {
                setProjectId('__none__')
              }
            }}
          >
            <SelectTrigger
              id="log-category"
              className="h-12 w-full rounded-xl bg-accent/30 border-border/50 hover:bg-accent/50 hover:border-primary/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate w-full">
                {(() => {
                  const config = CATEGORY_STYLES[category]
                  const IconComponent = config.icon
                  return (
                    <>
                      <IconComponent className={cn("w-4 h-4 shrink-0", config.iconColorActive)} />
                      <span className="font-semibold text-sm truncate">{config.label}</span>
                    </>
                  )
                })()}
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-xl max-h-[280px] p-1.5">
              {(Object.keys(CATEGORY_STYLES) as WorkCategory[]).map((catKey) => {
                const config = CATEGORY_STYLES[catKey]
                const IconComponent = config.icon
                const isSelected = category === catKey

                return (
                  <SelectItem
                    key={catKey}
                    value={catKey}
                    className="rounded-xl py-2.5 px-3.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-all duration-150 pl-11 relative"
                  >
                    {/* Left radio indicator circle */}
                    <div className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/35 bg-transparent"
                    )}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <IconComponent className={cn("w-4.5 h-4.5 shrink-0", config.iconColorActive)} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[13px] text-foreground tracking-wide">{config.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{config.desc}</span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Project Selector with Radio Icons */}
        <div className={cn("space-y-2 transition-all duration-300", !isProjectRelevant ? "opacity-50" : "opacity-100")}>
          <Label htmlFor="log-project" className="text-[13px] font-bold text-foreground/90 ml-0.5">
            Assigned Project
          </Label>
          <Select
            value={isProjectRelevant ? projectId : '__none__'}
            onValueChange={setProjectId}
            disabled={!isProjectRelevant}
          >
            <SelectTrigger
              id="log-project"
              className="h-12 w-full rounded-xl bg-accent/30 border-border/50 hover:bg-accent/50 hover:border-primary/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate w-full">
                {isProjectRelevant && projectId !== '__none__' ? (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: projects.find(p => p.id === projectId)?.color ?? '#94a3b8' }}
                    />
                    <span className="font-semibold text-sm truncate">
                      {projects.find(p => p.id === projectId)?.name ?? 'Choose a project'}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm font-medium truncate">
                    {!isProjectRelevant ? 'Not applicable' : 'None / Personal'}
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-xl max-h-[280px] p-1.5">
              <SelectItem
                value="__none__"
                className="rounded-xl py-2.5 px-3.5 cursor-pointer focus:bg-primary/5 transition-all duration-150 pl-11 relative"
              >
                {/* Left radio indicator circle */}
                <div className={cn(
                  "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                  projectId === '__none__'
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/35 bg-transparent"
                )}>
                  {projectId === '__none__' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="italic text-muted-foreground text-[13px]">None / Personal Activity</span>
              </SelectItem>
              {projects.map((p) => {
                const isSelected = projectId === p.id
                return (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="rounded-xl py-2.5 px-3.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-all duration-150 pl-11 relative"
                  >
                    {/* Left radio indicator circle */}
                    <div className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/35 bg-transparent"
                    )}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full ring-4 ring-background shrink-0 shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[13px] text-foreground tracking-wide">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Active tracking code</span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* ROW 2: Date & Hours Side-by-Side Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Date Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="log-date" className="text-[13px] font-bold text-foreground/90 ml-0.5">
              Entry Date
            </Label>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Input
            id="log-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayLocalDate}
            required
            className="h-12 rounded-xl bg-accent/30 border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          {/* Shortcuts */}
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setDate(todayLocalDate)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none",
                date === todayLocalDate
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-accent/40 text-muted-foreground border-border/50 hover:bg-accent/80 hover:text-foreground"
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDate(yesterdayLocalDate)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none",
                date === yesterdayLocalDate
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-accent/40 text-muted-foreground border-border/50 hover:bg-accent/80 hover:text-foreground"
              )}
            >
              Yesterday
            </button>
          </div>
        </div>

        {/* Hours Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="log-hours" className="text-[13px] font-bold text-foreground/90 ml-0.5">
              Hours Worked
            </Label>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="relative">
            <Input
              id="log-hours"
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              placeholder="Hours worked (max 12)"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              className="h-12 rounded-xl bg-accent/30 border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all pr-12 font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
              HRS
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex gap-1.5 pt-0.5">
            {[2, 4, 6, 8].map((h) => {
              const hStr = h.toString()
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(hStr)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none",
                    hours === hStr
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-accent/40 text-muted-foreground border-border/50 hover:bg-accent/80 hover:text-foreground"
                  )}
                >
                  {h}h
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* ROW 3: Activity Description Textarea (Full Width) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="log-description" className="text-[13px] font-bold text-foreground/90 ml-0.5">
            Activity Description
          </Label>
          <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 bg-accent/70 border border-border/40 rounded-full select-none">
            Markdown Supported
          </span>
        </div>
        <Textarea
          id="log-description"
          placeholder="What did you achieve? Be specific about tasks, outcomes, and progress..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none rounded-xl bg-accent/30 border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all p-4 leading-relaxed min-h-[90px]"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground leading-snug max-w-[280px]">
          By submitting, you certify that hours logged represent actual hours worked under company policy.
        </p>
        <div className="flex items-center gap-3">
          <Button
            id="log-form-submit"
            type="submit"
            disabled={isPending}
            size="lg"
            className="px-10 h-12 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-primary/30 cursor-pointer"
          >
            {isPending
              ? (initialData ? 'Saving...' : 'Submitting...')
              : (initialData ? 'Update Entry' : 'Create Entry')}
          </Button>
        </div>
      </div>
    </form>
  )
}
