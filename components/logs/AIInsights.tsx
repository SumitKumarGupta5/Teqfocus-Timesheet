'use client'

import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Target,
  Flame,
  User,
  Shield,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkLogInsight } from '@/lib/queries/insights'

interface AIInsightsProps {
  initialInsights: WorkLogInsight | null
  month: string
  targetUserId: string
  isManagerOrAdmin: boolean
  hasLogs: boolean
}

export function AIInsights({
  initialInsights,
  month,
  isManagerOrAdmin,
}: AIInsightsProps) {
  const insights = initialInsights

  // Default active tab: "employee" for employees, "manager" for managers
  const [activeTab, setActiveTab] = useState<'employee' | 'manager' | 'shared'>(
    isManagerOrAdmin ? 'manager' : 'employee'
  )

  // Format month to a readable string (e.g., "May 2026")
  const [year, monthStr] = month.split('-')
  const dateObj = new Date(Number(year), Number(monthStr) - 1, 1)
  const readableMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Helper colors for burnout risk
  const getBurnoutColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'low':
      default:
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/5 via-accent/30 to-background border border-border/50 p-6 md:p-8 shadow-sm">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-accent/40 blur-2xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6 w-full">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 p-3 rounded-2xl bg-background border border-border text-primary shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  Grok AI Productivity Insights
                </h2>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Analysis Period: {readableMonth}
                </p>
              </div>
            </div>
          </div>

          {insights ? (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex p-1 bg-accent/30 border border-border/40 rounded-2xl w-fit max-w-full overflow-x-auto gap-1">
                {isManagerOrAdmin && (
                  <button
                    onClick={() => setActiveTab('manager')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap",
                      activeTab === 'manager'
                        ? "bg-background text-foreground shadow-sm border border-border/30"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Manager View</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('employee')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap",
                    activeTab === 'employee'
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Employee View</span>
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap",
                    activeTab === 'shared'
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Shared Summary</span>
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="bg-background/40 border border-border/40 rounded-3xl p-5 md:p-6 backdrop-blur-sm min-h-[120px] transition-all">
                {activeTab === 'manager' && isManagerOrAdmin && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Executive Performance Summary</span>
                    </div>
                    <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed font-medium">
                      {insights.manager_insights}
                    </p>
                  </div>
                )}

                {activeTab === 'employee' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                      <User className="w-3.5 h-3.5" />
                      <span>Supportive Growth Summary</span>
                    </div>
                    <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed font-medium">
                      {insights.employee_insights}
                    </p>
                  </div>
                )}

                {activeTab === 'shared' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                      <Users className="w-3.5 h-3.5" />
                      <span>Unified Mediation Summary</span>
                    </div>
                    <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed font-medium">
                      {insights.shared_insights}
                    </p>
                  </div>
                )}
              </div>

              {/* Lists Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {insights.strengths?.map((str, idx) => (
                      <li key={idx} className="text-xs md:text-sm font-medium text-foreground/80 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>Learning Curves</span>
                  </div>
                  <ul className="space-y-2">
                    {insights.improvement?.map((imp, idx) => (
                      <li key={idx} className="text-xs md:text-sm font-medium text-foreground/80 flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Goals */}
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <Target className="w-4 h-4 shrink-0" />
                    <span>Next Month Goals</span>
                  </div>
                  <ul className="space-y-2">
                    {insights.next_month_goals?.map((goal, idx) => (
                      <li key={idx} className="text-xs md:text-sm font-medium text-foreground/80 flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] text-muted-foreground leading-relaxed font-medium">
                No productivity insights have been generated for this employee for {readableMonth}.
              </p>
              <div className="text-xs text-primary font-bold bg-primary/10 text-primary p-3 rounded-xl border border-primary/20 inline-block animate-pulse">
                Productivity insights are automatically generated on the 25th of every month. Please check back then.
              </div>
            </div>
          )}
        </div>

        {/* Right Metric Gauges Panel (Only rendered if insights are generated) */}
        {insights && (
          <div className="w-full lg:w-[260px] shrink-0 flex flex-col sm:flex-row lg:flex-col gap-6">
            {/* Productivity Card */}
            <div className="flex-1 bg-background/50 border border-border/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4 shadow-sm backdrop-blur-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Productivity Score
              </span>
              
              {/* Premium score circle visual */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted/20 fill-none"
                    strokeWidth="8"
                  />
                  {/* Gradient Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-primary fill-none transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * insights.productivity_score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold tracking-tighter text-foreground">
                    {insights.productivity_score}%
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                Based on workload depth & log description quality.
              </span>
            </div>

            {/* Burnout Risk Card */}
            <div className="flex-1 bg-background/50 border border-border/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4 shadow-sm backdrop-blur-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Burnout Risk
              </span>

              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all relative",
                getBurnoutColor(insights.burnout_risk)
              )}>
                {/* Breathing glow animation for high/medium risk */}
                {insights.burnout_risk?.toLowerCase() !== 'low' && (
                  <span className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-25",
                    insights.burnout_risk?.toLowerCase() === 'high' ? 'bg-red-500' : 'bg-amber-500'
                  )} />
                )}
                <Flame className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border",
                  getBurnoutColor(insights.burnout_risk)
                )}>
                  {insights.burnout_risk} Risk
                </span>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                Calculated from weekly hours logged and fatigue markers.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
